import { createClerkClient, type UserJSON } from "@clerk/backend";
import { Injectable, Logger } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs ConfigService for constructor injection
import { ConfigService } from "@nestjs/config";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.user)
import { PrismaService } from "../prisma/prisma.service";
import { allocateUniqueWorkspaceShortLink } from "../workspaces/allocate-workspace-short-link";

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const t = value.trim();
  return t === "" ? null : t;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(u: Record<string, unknown>, snake: string, camel: string): string | null {
  const a = u[snake];
  const b = u[camel];
  if (typeof a === "string") {
    return trimOrNull(a);
  }
  if (typeof b === "string") {
    return trimOrNull(b);
  }
  return null;
}

function listObjects(u: Record<string, unknown>, snake: string, camel: string): unknown[] {
  const a = u[snake];
  const b = u[camel];
  if (Array.isArray(a)) {
    return a;
  }
  if (Array.isArray(b)) {
    return b;
  }
  return [];
}

function emailFromAddressEntry(entry: unknown): string | null {
  const o = asRecord(entry);
  if (!o) {
    return null;
  }
  return readString(o, "email_address", "emailAddress");
}

/**
 * Match how Clerk resolves “primary” in the dashboard: by id, not array order.
 * Accepts snake_case (UserJSON) or camelCase (some webhook/session shapes).
 * Falls back to OAuth-linked email when `email_addresses` is still empty.
 */
function resolveClerkUserEmail(clerkUser: UserJSON): string {
  const u = clerkUser as unknown as Record<string, unknown>;
  const id = typeof u.id === "string" ? u.id : clerkUser.id;
  const primaryId =
    (typeof u.primary_email_address_id === "string"
      ? u.primary_email_address_id
      : null) ??
    (typeof u.primaryEmailAddressId === "string" ? u.primaryEmailAddressId : null);

  const addresses = listObjects(u, "email_addresses", "emailAddresses");
  if (primaryId) {
    for (const item of addresses) {
      const o = asRecord(item);
      if (o && typeof o.id === "string" && o.id === primaryId) {
        const addr = emailFromAddressEntry(item);
        if (addr) {
          return addr;
        }
      }
    }
  }
  for (const item of addresses) {
    const addr = emailFromAddressEntry(item);
    if (addr) {
      return addr;
    }
  }
  for (const item of listObjects(u, "external_accounts", "externalAccounts")) {
    const addr = emailFromAddressEntry(item);
    if (addr) {
      return addr;
    }
  }
  return `${id}@clerk.placeholder`;
}

/** OAuth often fills names on `external_accounts` before top-level `first_name` / `last_name`. */
function resolveClerkUserNames(clerkUser: UserJSON): {
  firstName: string | null;
  lastName: string | null;
} {
  const u = clerkUser as unknown as Record<string, unknown>;
  let firstName = readString(u, "first_name", "firstName");
  let lastName = readString(u, "last_name", "lastName");
  if (firstName && lastName) {
    return { firstName, lastName };
  }
  const extList = listObjects(u, "external_accounts", "externalAccounts");
  const ext = asRecord(extList[0]);
  if (ext) {
    firstName = firstName ?? readString(ext, "first_name", "firstName");
    lastName = lastName ?? readString(ext, "last_name", "lastName");
  }
  return { firstName, lastName };
}

function resolveClerkUserImageUrl(clerkUser: UserJSON): string | null {
  const u = clerkUser as unknown as Record<string, unknown>;
  return readString(u, "image_url", "imageUrl");
}

@Injectable()
export class ClerkWebhooksService {
  private readonly logger = new Logger(ClerkWebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  /**
   * `session.created` (and occasionally first webhooks) can omit emails; Backend API returns the full user.
   */
  private async mergeClerkUserFromBackendApiIfNeeded(
    clerkUser: UserJSON
  ): Promise<UserJSON> {
    const email = resolveClerkUserEmail(clerkUser);
    if (!email.endsWith("@clerk.placeholder")) {
      return clerkUser;
    }
    const secretKey = this.config.get<string>("CLERK_SECRET_KEY")?.trim();
    if (!secretKey) {
      return clerkUser;
    }
    try {
      const clerk = createClerkClient({ secretKey });
      const full = await clerk.users.getUser(clerkUser.id);
      if (full.raw) {
        this.logger.log(
          `Clerk user ${clerkUser.id}: filled missing email via Backend API (webhook payload was incomplete).`
        );
        return full.raw;
      }
    } catch (e) {
      this.logger.warn(
        `Clerk user ${clerkUser.id}: Backend API getUser failed while enriching email: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
    return clerkUser;
  }

  async ensureUserAndDefaultWorkspace(clerkUser: UserJSON): Promise<void> {
    const clerkUserId = clerkUser.id;

    const merged = await this.mergeClerkUserFromBackendApiIfNeeded(clerkUser);
    const email = resolveClerkUserEmail(merged);
    const { firstName, lastName } = resolveClerkUserNames(merged);
    const imageUrl = resolveClerkUserImageUrl(merged);

    const upsertPayload = {
      clerkUserId,
      email,
      firstName,
      lastName,
      imageUrl,
    };
    this.logger.log(
      `Prisma user upsert payload: ${JSON.stringify(upsertPayload)}`
    );

    const user = await this.prisma.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        email,
        firstName,
        lastName,
        imageUrl,
      },
      update: {
        email,
        firstName,
        lastName,
        imageUrl,
      },
    });

    const existingWorkspace = await this.prisma.workspace.findFirst({
      where: { ownerId: user.id },
    });

    if (!existingWorkspace) {
      await this.prisma.workspace.create({
        data: {
          name: "My workspace",
          description: null,
          shortLink: await allocateUniqueWorkspaceShortLink(this.prisma),
          ownerId: user.id,
        },
      });
    }
  }

  /** Idempotent: no-op if the user was never synced to the DB. */
  async deleteUserByClerkId(clerkUserId: string): Promise<{ count: number }> {
    const result = await this.prisma.user.deleteMany({
      where: { clerkUserId },
    });
    if (result.count > 0) {
      this.logger.log(
        `User deleted from database (clerk user.deleted webhook): clerkUserId=${clerkUserId}, rows=${result.count}`
      );
    } else {
      this.logger.log(
        `User delete webhook: no local user for clerkUserId=${clerkUserId} (already removed or never synced)`
      );
    }
    return result;
  }
}

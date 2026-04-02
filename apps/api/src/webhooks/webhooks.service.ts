import type { UserJSON } from "@clerk/backend";
import { Injectable, Logger } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.user)
import { PrismaService } from "../prisma/prisma.service";
import { allocateUniqueWorkspaceShortLink } from "../workspaces/allocate-workspace-short-link";

@Injectable()
export class ClerkWebhooksService {
  private readonly logger = new Logger(ClerkWebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ensureUserAndDefaultWorkspace(clerkUser: UserJSON): Promise<void> {
    const clerkUserId = clerkUser.id;

    const email: string =
      clerkUser.email_addresses[0]?.email_address ??
      `${clerkUserId}@clerk.placeholder`;

    const firstName = clerkUser.first_name;
    const lastName = clerkUser.last_name;
    const imageUrl =
      clerkUser.image_url.trim() === "" ? null : clerkUser.image_url;

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

import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.user)
import { PrismaService } from "../prisma/prisma.service";
import type { ClerkAuthPayload } from "../auth/clerk-auth.service";
import type { CreateUserInput, UpdateUserInput } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByClerkId(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
    });
  }

  findByClerkIdWithWorkspaces(clerkUserId: string) {
    return this.prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        workspaces: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  create(data: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        clerkUserId: data.clerkUserId,
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
      },
    });
  }

  update(id: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
      },
    });
  }

  upsertByClerkId(data: CreateUserInput) {
    return this.prisma.user.upsert({
      where: { clerkUserId: data.clerkUserId },
      create: {
        clerkUserId: data.clerkUserId,
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
      },
      update: {
        email: data.email,
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
      },
    });
  }

  /**
   * Upsert user from Clerk JWT claims and ensure a default workspace exists.
   * Call this on authenticated requests (e.g. from ClerkAuthGuard) — no webhooks required.
   */
  async ensureUserAndDefaultWorkspace(payload: ClerkAuthPayload): Promise<void> {
    const input = this.clerkPayloadToCreateUserInput(payload);
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { clerkUserId: input.clerkUserId },
        create: {
          clerkUserId: input.clerkUserId,
          email: input.email,
          firstName: input.firstName ?? undefined,
          lastName: input.lastName ?? undefined,
          imageUrl: input.imageUrl ?? undefined,
        },
        update: {
          email: input.email,
          firstName: input.firstName ?? undefined,
          lastName: input.lastName ?? undefined,
          imageUrl: input.imageUrl ?? undefined,
        },
      });

      const existing = await tx.workspace.findFirst({
        where: { ownerId: user.id },
      });
      if (!existing) {
        await tx.workspace.create({
          data: {
            name: "My workspace",
            ownerId: user.id,
          },
        });
      }
    });
  }

  private clerkPayloadToCreateUserInput(payload: ClerkAuthPayload): CreateUserInput {
    const email =
      typeof payload.email === "string" && payload.email.length > 0
        ? payload.email
        : `${payload.sub}@clerk.placeholder`;

    let firstName: string | null = null;
    if (typeof payload.given_name === "string") {
      firstName = payload.given_name;
    } else if (typeof payload.first_name === "string") {
      firstName = payload.first_name;
    }

    let lastName: string | null = null;
    if (typeof payload.family_name === "string") {
      lastName = payload.family_name;
    } else if (typeof payload.last_name === "string") {
      lastName = payload.last_name;
    }

    let imageUrl: string | null = null;
    if (typeof payload.picture === "string") {
      imageUrl = payload.picture;
    } else if (typeof payload.image_url === "string") {
      imageUrl = payload.image_url;
    }

    return {
      clerkUserId: payload.sub,
      email,
      firstName,
      lastName,
      imageUrl,
    };
  }
}

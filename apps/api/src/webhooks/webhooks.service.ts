import type { UserJSON } from "@clerk/backend";
import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.user)
import { PrismaService } from "../prisma/prisma.service";
import { allocateUniqueWorkspaceShortLink } from "../workspaces/allocate-workspace-short-link";

@Injectable()
export class ClerkWebhooksService {
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
}

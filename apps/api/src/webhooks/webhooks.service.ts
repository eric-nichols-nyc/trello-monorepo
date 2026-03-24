import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ClerkWebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUserAndDefaultWorkspace(clerkUser: any): Promise<void> {
    const clerkUserId: string | undefined = clerkUser?.id;
    if (!clerkUserId) {
      throw new Error("Webhook user payload is missing data.id");
    }

    const email: string =
      clerkUser?.email_addresses?.[0]?.email_address ??
      `${clerkUserId}@clerk.placeholder`;

    const firstName: string | null =
      typeof clerkUser?.first_name === "string"
        ? clerkUser.first_name
        : typeof clerkUser?.given_name === "string"
          ? clerkUser.given_name
          : null;

    const lastName: string | null =
      typeof clerkUser?.last_name === "string"
        ? clerkUser.last_name
        : typeof clerkUser?.family_name === "string"
          ? clerkUser.family_name
          : null;

    const imageUrl: string | null =
      typeof clerkUser?.image_url === "string"
        ? clerkUser.image_url
        : typeof clerkUser?.profile_image_url === "string"
          ? clerkUser.profile_image_url
          : null;

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
          ownerId: user.id,
        },
      });
    }
  }
}


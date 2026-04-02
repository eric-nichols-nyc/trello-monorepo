import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.user)
import { PrismaService } from "../prisma/prisma.service";

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

  deleteByClerkId(clerkUserId: string) {
    return this.prisma.user.delete({
      where: { clerkUserId },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }
}

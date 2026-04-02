import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.user)
import { PrismaService } from "../prisma/prisma.service";
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
}

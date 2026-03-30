import { Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.workspace)
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import type { CreateWorkspaceInput } from "./schemas/create-workspace.schema";

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: { boards: true },
    });
  }

  findByOwnerId(ownerId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    });
  }

  findOne(id: string) {
    return this.prisma.workspace.findUniqueOrThrow({
      where: { id },
      include: { boards: true },
    });
  }

  create(data: CreateWorkspaceInput & { ownerId: string }) {
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ownerId: data.ownerId,
      },
    });
  }

  update(id: string, data: UpdateWorkspaceDto) {
    return this.prisma.workspace.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }
}

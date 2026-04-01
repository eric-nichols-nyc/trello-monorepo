import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.workspace)
import { PrismaService } from "../prisma/prisma.service";
import { allocateUniqueWorkspaceShortLink } from "./allocate-workspace-short-link";
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
      select: { id: true, name: true, shortLink: true },
    });
  }

  async findOne(workspaceKey: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [{ id: workspaceKey }, { shortLink: workspaceKey }],
      },
      include: { boards: true },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceKey} not found`);
    }
    return workspace;
  }

  async create(data: CreateWorkspaceInput & { ownerId: string }) {
    const resolvedShortLink =
      data.shortLink ?? (await allocateUniqueWorkspaceShortLink(this.prisma));
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        shortLink: resolvedShortLink,
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

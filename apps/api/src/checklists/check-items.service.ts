import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed for PrismaService delegate types
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateCheckItemDto } from "./dto/update-check-item.dto";
import type { CreateCheckItemInput } from "./schemas/create-check-item.schema";

@Injectable()
export class CheckItemsService {
  constructor(private readonly prisma: PrismaService) {}

  findByChecklistForUser(checklistId: string, clerkUserId: string) {
    return this.prisma.checkItem.findMany({
      where: {
        checklistId,
        checklist: { card: { board: { user: { clerkUserId } } } },
      },
      orderBy: { pos: "asc" },
    });
  }

  async createForUser(
    checklistId: string,
    clerkUserId: string,
    data: CreateCheckItemInput
  ) {
    const checklist = await this.prisma.checklist.findFirst({
      where: { id: checklistId, card: { board: { user: { clerkUserId } } } },
    });
    if (!checklist) {
      throw new NotFoundException(`Checklist ${checklistId} not found`);
    }
    const pos = data.pos ?? Date.now();
    return this.prisma.checkItem.create({
      data: {
        name: data.name,
        pos,
        completed: data.completed ?? false,
        checklistId,
      },
    });
  }

  findOneForUser(id: string, clerkUserId: string) {
    return this.prisma.checkItem.findFirstOrThrow({
      where: {
        id,
        checklist: { card: { board: { user: { clerkUserId } } } },
      },
      include: { checklist: true },
    });
  }

  async updateForUser(
    id: string,
    clerkUserId: string,
    data: UpdateCheckItemDto
  ) {
    const item = await this.prisma.checkItem.findFirst({
      where: {
        id,
        checklist: { card: { board: { user: { clerkUserId } } } },
      },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException(`Checklist item ${id} not found`);
    }
    return this.prisma.checkItem.update({
      where: { id: item.id },
      data,
    });
  }

  async removeForUser(id: string, clerkUserId: string) {
    const deleted = await this.prisma.checkItem.deleteMany({
      where: {
        id,
        checklist: { card: { board: { user: { clerkUserId } } } },
      },
    });
    if (deleted.count === 0) {
      throw new NotFoundException(`Checklist item ${id} not found`);
    }
    return { id, deleted: true };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed for PrismaService delegate types
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateChecklistDto } from "./dto/update-checklist.dto";
import type { CreateChecklistInput } from "./schemas/create-checklist.schema";

@Injectable()
export class ChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  findByCardForUser(cardId: string, clerkUserId: string) {
    return this.prisma.checklist.findMany({
      where: { cardId, card: { board: { user: { clerkUserId } } } },
      orderBy: { pos: "asc" },
      include: { items: { orderBy: { pos: "asc" } } },
    });
  }

  async createForUser(
    cardId: string,
    clerkUserId: string,
    data: CreateChecklistInput
  ) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, board: { user: { clerkUserId } } },
      select: { id: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${cardId} not found`);
    }
    const pos = data.pos ?? Date.now();
    return this.prisma.checklist.create({
      data: {
        name: data.name,
        pos,
        cardId,
      },
      include: { items: true },
    });
  }

  findOneForUser(id: string, clerkUserId: string) {
    return this.prisma.checklist.findFirstOrThrow({
      where: { id, card: { board: { user: { clerkUserId } } } },
      include: {
        card: true,
        items: { orderBy: { pos: "asc" } },
      },
    });
  }

  async updateForUser(
    id: string,
    clerkUserId: string,
    data: UpdateChecklistDto
  ) {
    const checklist = await this.prisma.checklist.findFirst({
      where: { id, card: { board: { user: { clerkUserId } } } },
      select: { id: true },
    });
    if (!checklist) {
      throw new NotFoundException(`Checklist ${id} not found`);
    }
    return this.prisma.checklist.update({
      where: { id: checklist.id },
      data,
      include: { items: { orderBy: { pos: "asc" } } },
    });
  }

  async removeForUser(id: string, clerkUserId: string) {
    const deleted = await this.prisma.checklist.deleteMany({
      where: { id, card: { board: { user: { clerkUserId } } } },
    });
    if (deleted.count === 0) {
      throw new NotFoundException(`Checklist ${id} not found`);
    }
    return { id, deleted: true };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed for PrismaService delegate types
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateListDto } from "./dto";
import type { CreateListInput } from "./schemas/create-list.schema";

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  findByBoardForUser(boardId: string, clerkUserId: string) {
    return this.prisma.list.findMany({
      where: { boardId, board: { user: { clerkUserId } } },
      orderBy: { pos: "asc" },
      include: { cards: { orderBy: { pos: "asc" } } },
    });
  }

  async createForUser(boardId: string, clerkUserId: string, data: CreateListInput) {
    const board = await this.prisma.board.findFirst({
      where: { id: boardId, user: { clerkUserId } },
    });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }
    const pos = data.pos ?? Date.now();
    return this.prisma.list.create({
      data: {
        name: data.name,
        pos,
        closed: data.closed ?? false,
        boardId,
      },
    });
  }

  findOneForUser(id: string, clerkUserId: string) {
    return this.prisma.list.findFirstOrThrow({
      where: { id, board: { user: { clerkUserId } } },
      include: {
        board: true,
        cards: { orderBy: { pos: "asc" } },
      },
    });
  }

  async updateForUser(id: string, clerkUserId: string, data: UpdateListDto) {
    const list = await this.prisma.list.findFirst({
      where: { id, board: { user: { clerkUserId } } },
      select: { id: true },
    });
    if (!list) {
      throw new NotFoundException(`List ${id} not found`);
    }
    return this.prisma.list.update({
      where: { id: list.id },
      data,
    });
  }

  async removeForUser(id: string, clerkUserId: string) {
    const deleted = await this.prisma.list.deleteMany({
      where: { id, board: { user: { clerkUserId } } },
    });
    if (deleted.count === 0) {
      throw new NotFoundException(`List ${id} not found`);
    }
    return { id, deleted: true };
  }
}

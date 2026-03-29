import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed for PrismaService delegate types
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateCardDto } from "./dto/update-card.dto";
import type { CreateCardInput } from "./schemas/create-card.schema";

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findByListForUser(listId: string, clerkUserId: string) {
    return this.prisma.card.findMany({
      where: { listId, board: { user: { clerkUserId } } },
      orderBy: { pos: "asc" },
      include: {
        comments: { orderBy: { createdAt: "asc" } },
        checklists: {
          orderBy: { pos: "asc" },
          include: { items: { orderBy: { pos: "asc" } } },
        },
        labels: true,
      },
    });
  }

  async createForUser(
    listId: string,
    clerkUserId: string,
    data: CreateCardInput
  ) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });
    if (!list || list.board.userId === undefined) {
      throw new NotFoundException(`List ${listId} not found`);
    }
    const board = await this.prisma.board.findFirst({
      where: { id: list.boardId, user: { clerkUserId } },
      select: { id: true },
    });
    if (!board) {
      throw new NotFoundException(`List ${listId} not found`);
    }
    const pos = data.pos ?? Date.now();
    return this.prisma.card.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        pos,
        closed: data.closed ?? false,
        dueDate: data.dueDate ?? null,
        listId,
        boardId: list.boardId,
        assigneeId: data.assigneeId ?? null,
      },
    });
  }

  findOneForUser(id: string, clerkUserId: string) {
    return this.prisma.card.findFirstOrThrow({
      where: { id, board: { user: { clerkUserId } } },
      include: {
        list: true,
        board: true,
        comments: { orderBy: { createdAt: "asc" }, include: { author: true } },
        checklists: {
          orderBy: { pos: "asc" },
          include: { items: { orderBy: { pos: "asc" } } },
        },
        labels: true,
        assignee: true,
      },
    });
  }

  async updateForUser(id: string, clerkUserId: string, data: UpdateCardDto) {
    const card = await this.prisma.card.findFirst({
      where: { id, board: { user: { clerkUserId } } },
      select: { id: true, boardId: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }
    if (data.listId) {
      const targetList = await this.prisma.list.findUnique({
        where: { id: data.listId },
        select: { boardId: true },
      });
      if (!targetList) {
        throw new NotFoundException(`List ${data.listId} not found`);
      }
      if (targetList.boardId !== card.boardId) {
        throw new BadRequestException(
          "Cannot move card to a list on a different board"
        );
      }
    }
    return this.prisma.card.update({
      where: { id: card.id },
      data,
    });
  }

  /**
   * Sets `pos` for every card in the list to `(index + 1) * 1000` in one transaction.
   * `cardIdsInOrder` must be a permutation of cards currently in `listId`.
   */
  async setListCardOrderForUser(
    listId: string,
    clerkUserId: string,
    cardIdsInOrder: string[]
  ) {
    const list = await this.prisma.list.findFirst({
      where: { id: listId, board: { user: { clerkUserId } } },
      select: { id: true },
    });
    if (!list) {
      throw new NotFoundException(`List ${listId} not found`);
    }

    const existing = await this.prisma.card.findMany({
      where: { listId },
      select: { id: true },
    });
    if (existing.length !== cardIdsInOrder.length) {
      throw new BadRequestException(
        "cardIds must list every card in the list exactly once"
      );
    }
    const existingSet = new Set(existing.map((c) => c.id));
    for (const id of cardIdsInOrder) {
      if (!existingSet.has(id)) {
        throw new BadRequestException(`Card ${id} is not in list ${listId}`);
      }
    }

    const gap = 1000;
    await this.prisma.$transaction(
      cardIdsInOrder.map((id, index) =>
        this.prisma.card.update({
          where: { id },
          data: { pos: (index + 1) * gap },
        })
      )
    );

    return this.findByListForUser(listId, clerkUserId);
  }

  async removeForUser(id: string, clerkUserId: string) {
    const deleted = await this.prisma.card.deleteMany({
      where: { id, board: { user: { clerkUserId } } },
    });
    if (deleted.count === 0) {
      throw new NotFoundException(`Card ${id} not found`);
    }
    return { id, deleted: true };
  }
}

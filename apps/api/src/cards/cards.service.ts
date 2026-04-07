import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { randomShortLink } from "../common/short-link";
// biome-ignore lint/style/useImportType: value import needed for PrismaService delegate types
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateCardDto } from "./dto/update-card.dto";
import type { CreateCardInput } from "./schemas/create-card.schema";

function createCardCoverRow(data: CreateCardInput): {
  coverColor: string | null;
  coverImage: string | null;
} {
  if (data.coverImage !== undefined) {
    return { coverImage: data.coverImage, coverColor: null };
  }
  if (data.coverColor !== undefined) {
    return { coverColor: data.coverColor, coverImage: null };
  }
  return { coverColor: null, coverImage: null };
}

/** When setting a non-empty image or color cover, clear the other kind (Trello-style). */
function applyCardCoverExclusivity(patch: UpdateCardDto): void {
  const img = patch.coverImage;
  const col = patch.coverColor;
  const imgActive =
    img !== undefined && img !== null && String(img).length > 0;
  const colActive =
    col !== undefined && col !== null && String(col).length > 0;
  if (imgActive && colActive) {
    patch.coverColor = null;
    return;
  }
  if (imgActive) {
    patch.coverColor = null;
  }
  if (colActive) {
    patch.coverImage = null;
  }
}

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Picks a fresh `shortLink` not yet used by any card (retries on rare collisions). */
  private async allocateUniqueCardShortLink(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = randomShortLink();
      const taken = await this.prisma.card.findUnique({
        where: { shortLink: candidate },
        select: { id: true },
      });
      if (!taken) {
        return candidate;
      }
    }
    throw new InternalServerErrorException(
      "Could not allocate a unique card shortLink; try again."
    );
  }

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
    const covers = createCardCoverRow(data);
    const resolvedShortLink =
      data.shortLink ?? (await this.allocateUniqueCardShortLink());
    return this.prisma.card.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        pos,
        closed: data.closed ?? false,
        completed: data.completed ?? false,
        dueDate: data.dueDate ?? null,
        listId,
        boardId: list.boardId,
        assigneeId: data.assigneeId ?? null,
        shortLink: resolvedShortLink,
        coverColor: covers.coverColor,
        coverImage: covers.coverImage,
      },
    });
  }

  findOneForUser(cardKey: string, clerkUserId: string) {
    return this.prisma.card.findFirstOrThrow({
      where: {
        board: { user: { clerkUserId } },
        OR: [{ id: cardKey }, { shortLink: cardKey }],
      },
      include: {
        list: true,
        board: {
          include: {
            lists: { orderBy: { pos: "asc" } },
          },
        },
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

  async updateForUser(cardKey: string, clerkUserId: string, data: UpdateCardDto) {
    const card = await this.prisma.card.findFirst({
      where: {
        board: { user: { clerkUserId } },
        OR: [{ id: cardKey }, { shortLink: cardKey }],
      },
      select: { id: true, boardId: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${cardKey} not found`);
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
    const patch: UpdateCardDto = { ...data };
    applyCardCoverExclusivity(patch);
    return this.prisma.card.update({
      where: { id: card.id },
      data: patch,
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

  async removeForUser(cardKey: string, clerkUserId: string) {
    const card = await this.prisma.card.findFirst({
      where: {
        board: { user: { clerkUserId } },
        OR: [{ id: cardKey }, { shortLink: cardKey }],
      },
      select: { id: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${cardKey} not found`);
    }
    await this.prisma.card.delete({ where: { id: card.id } });
    return { id: card.id, deleted: true };
  }
}

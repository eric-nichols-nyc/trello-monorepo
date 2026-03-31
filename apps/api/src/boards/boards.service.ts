import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.board)
import { PrismaService } from "../prisma/prisma.service";
import { randomShortLink } from "../common/short-link";
import type { Prisma } from "../../generated/prisma/client";
import type { UpdateBoardDto } from "./dto/update-board.dto";
import type { CreateBoardInput } from "./schemas/create-board.schema";
import type { BoardTemplateDefinition } from "./templates/board-template.schema";
import { getBoardTemplateById } from "./templates/registry";

type BoardCreatePayload = Omit<CreateBoardInput, "templateId"> & {
  userId: string;
};

function templateCardCoverRow(card: {
  coverColor?: string;
  coverImage?: string;
}): { coverColor: string | null; coverImage: string | null } {
  if (card.coverImage !== undefined) {
    return { coverImage: card.coverImage, coverColor: null };
  }
  if (card.coverColor !== undefined) {
    return { coverColor: card.coverColor, coverImage: null };
  }
  return { coverColor: null, coverImage: null };
}

async function allocateUniqueCardShortLinkTx(
  tx: Prisma.TransactionClient
): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = randomShortLink();
    const taken = await tx.card.findUnique({
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

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.board.findMany({
      where: { userId, closed: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        shortLink: true,
        background: true,
        backgroundImage: true,
        backgroundBrightness: true,
        backgroundBottomColor: true,
        backgroundTopColor: true,
        backgroundColor: true,
        starred: true,
        closed: true,
        userId: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.board.findUniqueOrThrow({
      where: { id },
      include: {
        lists: {
          orderBy: { pos: "asc" },
          include: { cards: { orderBy: { pos: "asc" } } },
        },
      },
    });
  }

  async create(data: CreateBoardInput & { userId: string }) {
    const { templateId: _ignoreTemplate, ...payload } = data;
    const resolvedShortLink =
      payload.shortLink ?? (await this.allocateUniqueShortLink());
    return this.prisma.board.create({
      data: this.buildBoardCreateData(payload, resolvedShortLink, undefined),
    });
  }

  private buildBoardCreateData(
    data: BoardCreatePayload,
    resolvedShortLink: string,
    templateBoard: BoardTemplateDefinition["board"] | undefined
  ) {
    const t = templateBoard;
    return {
      name: data.name,
      workspaceId: data.workspaceId,
      userId: data.userId,
      shortLink: resolvedShortLink,
      ...(t?.backgroundImage !== undefined ? { backgroundImage: t.backgroundImage } : {}),
      ...(t?.backgroundBrightness !== undefined
        ? { backgroundBrightness: t.backgroundBrightness }
        : {}),
      ...(t?.backgroundBottomColor !== undefined
        ? { backgroundBottomColor: t.backgroundBottomColor }
        : {}),
      ...(t?.backgroundTopColor !== undefined
        ? { backgroundTopColor: t.backgroundTopColor }
        : {}),
      ...(t?.backgroundColor !== undefined ? { backgroundColor: t.backgroundColor } : {}),
      ...(data.backgroundImage !== undefined
        ? { backgroundImage: data.backgroundImage }
        : {}),
      ...(data.backgroundBrightness !== undefined
        ? { backgroundBrightness: data.backgroundBrightness }
        : {}),
      ...(data.backgroundBottomColor !== undefined
        ? { backgroundBottomColor: data.backgroundBottomColor }
        : {}),
      ...(data.backgroundTopColor !== undefined
        ? { backgroundTopColor: data.backgroundTopColor }
        : {}),
      ...(data.backgroundColor !== undefined
        ? { backgroundColor: data.backgroundColor }
        : {}),
      ...(data.starred !== undefined ? { starred: data.starred } : {}),
    };
  }

  private async createBoardFromTemplate(
    data: BoardCreatePayload,
    template: BoardTemplateDefinition
  ) {
    const resolvedShortLink =
      data.shortLink ?? (await this.allocateUniqueShortLink());
    const boardRow = this.buildBoardCreateData(
      data,
      resolvedShortLink,
      template.board
    );

    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.create({ data: boardRow });
      let listPos = 1000;
      for (const listDef of template.lists) {
        const list = await tx.list.create({
          data: {
            name: listDef.name,
            pos: listPos,
            boardId: board.id,
          },
        });
        listPos += 1000;
        let cardPos = 1000;
        for (const cardDef of listDef.cards) {
          const covers = templateCardCoverRow(cardDef);
          const cardShortLink = await allocateUniqueCardShortLinkTx(tx);
          await tx.card.create({
            data: {
              name: cardDef.name,
              description: cardDef.description ?? null,
              pos: cardPos,
              closed: cardDef.closed ?? false,
              dueDate:
                cardDef.dueDate !== undefined
                  ? new Date(cardDef.dueDate)
                  : null,
              listId: list.id,
              boardId: board.id,
              shortLink: cardShortLink,
              coverColor: covers.coverColor,
              coverImage: covers.coverImage,
            },
          });
          cardPos += 1000;
        }
      }
      return board;
    });
  }

  /** Picks a fresh `shortLink` not yet in the DB (retries on rare collisions). */
  private async allocateUniqueShortLink(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = randomShortLink();
      const taken = await this.prisma.board.findUnique({
        where: { shortLink: candidate },
        select: { id: true },
      });
      if (!taken) {
        return candidate;
      }
    }
    throw new InternalServerErrorException(
      "Could not allocate a unique shortLink; try again."
    );
  }

  update(id: string, data: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.board.delete({
      where: { id },
    });
  }

  async findOneForUser(boardKey: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: {
        userId,
        OR: [{ id: boardKey }, { shortLink: boardKey }],
      },
      include: {
        lists: {
          orderBy: { pos: "asc" },
          include: {
            cards: {
              orderBy: { pos: "asc" },
              include: {
                comments: {
                  orderBy: { createdAt: "asc" },
                  include: {
                    author: {
                      select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                      },
                    },
                  },
                },
                checklists: {
                  orderBy: { pos: "asc" },
                  include: {
                    items: { orderBy: { pos: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!board) {
      throw new NotFoundException(`Board ${boardKey} not found`);
    }
    return board;
  }

  async createForUser(data: CreateBoardInput & { userId: string }) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: data.workspaceId },
      select: { ownerId: true },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace ${data.workspaceId} not found`);
    }
    if (workspace.ownerId !== data.userId) {
      throw new ForbiddenException(
        "Cannot create board in another user workspace"
      );
    }
    const { templateId, ...boardPayload } = data;
    if (templateId !== undefined) {
      const template = getBoardTemplateById(templateId);
      if (!template) {
        throw new BadRequestException(`Unknown board template: ${templateId}`);
      }
      return await this.createBoardFromTemplate(boardPayload, template);
    }
    return await this.create(data);
  }

  async updateForUser(id: string, userId: string, data: UpdateBoardDto) {
    const board = await this.prisma.board.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!board) {
      throw new NotFoundException(`Board ${id} not found`);
    }
    return this.prisma.board.update({
      where: { id: board.id },
      data,
    });
  }

  async removeForUser(id: string, userId: string) {
    const deleted = await this.prisma.board.deleteMany({
      where: { id, userId },
    });
    if (deleted.count === 0) {
      throw new NotFoundException(`Board ${id} not found`);
    }
    return { id, deleted: true };
  }
}

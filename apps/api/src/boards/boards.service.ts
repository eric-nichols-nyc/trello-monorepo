import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.board)
import { PrismaService } from "../prisma/prisma.service";
import { randomBoardShortLink } from "./board-short-link";
import type { UpdateBoardDto } from "./dto/update-board.dto";
import type { CreateBoardInput } from "./schemas/create-board.schema";

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.board.findMany({
      where: { userId },
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
    const {
      name,
      workspaceId,
      userId,
      shortLink,
      backgroundImage,
      backgroundBrightness,
      backgroundBottomColor,
      backgroundTopColor,
      backgroundColor,
      starred,
    } = data;
    const resolvedShortLink =
      shortLink ?? (await this.allocateUniqueShortLink());
    return this.prisma.board.create({
      data: {
        name,
        workspaceId,
        userId,
        shortLink: resolvedShortLink,
        ...(backgroundImage !== undefined ? { backgroundImage } : {}),
        ...(backgroundBrightness !== undefined ? { backgroundBrightness } : {}),
        ...(backgroundBottomColor !== undefined
          ? { backgroundBottomColor }
          : {}),
        ...(backgroundTopColor !== undefined ? { backgroundTopColor } : {}),
        ...(backgroundColor !== undefined ? { backgroundColor } : {}),
        ...(starred !== undefined ? { starred } : {}),
      },
    });
  }

  /** Picks a fresh `shortLink` not yet in the DB (retries on rare collisions). */
  private async allocateUniqueShortLink(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidate = randomBoardShortLink();
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

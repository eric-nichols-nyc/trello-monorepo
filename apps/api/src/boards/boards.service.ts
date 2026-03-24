import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.board)
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateBoardDto } from "./dto";
import type { CreateBoardInput } from "./schemas/create-board.schema";

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string) {
    return this.prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { lists: { orderBy: { pos: 'asc' } } },
    });
  }

  findOne(id: string) {
    return this.prisma.board.findUniqueOrThrow({
      where: { id },
      include: {
        lists: {
          orderBy: { pos: 'asc' },
          include: { cards: { orderBy: { pos: 'asc' } } },
        },
      },
    });
  }

  create(data: CreateBoardInput & { userId: string }) {
    return this.prisma.board.create({
      data: {
        name: data.name,
        workspaceId: data.workspaceId,
        userId: data.userId,
      },
    });
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

  findOneByIdForUser(id: string, userId: string) {
    return this.prisma.board.findFirst({
      where: { id, userId },
      include: {
        lists: {
          orderBy: { pos: 'asc' },
          include: { cards: { orderBy: { pos: 'asc' } } },
        },
      },
    }).then((board) => {
      if (!board) {
        throw new NotFoundException(`Board ${id} not found`);
      }
      return board;
    });
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
      throw new ForbiddenException('Cannot create board in another user workspace');
    }
    return this.create(data);
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

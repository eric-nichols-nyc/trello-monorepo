import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: value import needed so PrismaService type includes PrismaClient (.board)
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateBoardDto } from "./dto";
import type { CreateBoardInput } from "./schemas/create-board.schema";

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.board.findMany({
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
}

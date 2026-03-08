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
      include: { lists: { orderBy: { position: 'asc' } } },
    });
  }

  findOne(id: string) {
    return this.prisma.board.findUniqueOrThrow({
      where: { id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: { cards: { orderBy: { position: 'asc' } } },
        },
      },
    });
  }

  create(data: CreateBoardInput & { ownerId: string }) {
    return this.prisma.board.create({
      data: { title: data.title, ownerId: data.ownerId },
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

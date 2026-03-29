import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: value import needed for PrismaService delegate types
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateCommentDto } from "./dto/update-comment.dto";
import type { CreateCommentInput } from "./schemas/create-comment.schema";

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  findByCardForUser(cardId: string, clerkUserId: string) {
    return this.prisma.comment.findMany({
      where: { cardId, card: { board: { user: { clerkUserId } } } },
      orderBy: { createdAt: "asc" },
      include: { author: true },
    });
  }

  async createForUser(
    cardId: string,
    clerkUserId: string,
    authorId: string,
    data: CreateCommentInput
  ) {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, board: { user: { clerkUserId } } },
      select: { id: true },
    });
    if (!card) {
      throw new NotFoundException(`Card ${cardId} not found`);
    }
    return this.prisma.comment.create({
      data: {
        text: data.text,
        cardId,
        authorId,
      },
      include: { author: true },
    });
  }

  findOneForUser(id: string, clerkUserId: string) {
    return this.prisma.comment.findFirstOrThrow({
      where: { id, card: { board: { user: { clerkUserId } } } },
      include: { author: true, card: true },
    });
  }

  async updateForUser(id: string, clerkUserId: string, data: UpdateCommentDto) {
    const comment = await this.prisma.comment.findFirst({
      where: { id, card: { board: { user: { clerkUserId } } } },
      select: { id: true },
    });
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
    return this.prisma.comment.update({
      where: { id: comment.id },
      data: { text: data.text },
      include: { author: true },
    });
  }

  async removeForUser(id: string, clerkUserId: string) {
    const deleted = await this.prisma.comment.deleteMany({
      where: { id, card: { board: { user: { clerkUserId } } } },
    });
    if (deleted.count === 0) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
    return { id, deleted: true };
  }
}

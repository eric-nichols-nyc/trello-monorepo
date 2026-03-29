import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import type { UsersService } from "../users/users.service";
import type { CommentsService } from "./comments.service";
import type { CreateCommentInput } from "./schemas/create-comment.schema";
import { createCommentSchema } from "./schemas/create-comment.schema";

@Controller("cards/:cardId/comments")
export class CardCommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  findByCard(
    @Param("cardId") cardId: string,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.commentsService.findByCardForUser(cardId, clerkUserId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(
    @Param("cardId") cardId: string,
    @Body(new ZodValidationPipe(createCommentSchema)) body: CreateCommentInput,
    @CurrentUser("sub") clerkUserId: string
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Complete an authenticated API request first."
      );
    }
    return this.commentsService.createForUser(
      cardId,
      clerkUserId,
      user.id,
      body
    );
  }
}

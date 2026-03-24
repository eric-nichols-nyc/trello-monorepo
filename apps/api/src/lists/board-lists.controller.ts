import { Controller, Get, Param, Post, Body, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ListsService } from "./lists.service";
import { createListSchema } from "./schemas/create-list.schema";
import type { CreateListInput } from "./schemas/create-list.schema";

@Controller("boards/:boardId/lists")
export class BoardListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  findByBoard(
    @Param("boardId") boardId: string,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.listsService.findByBoardForUser(boardId, clerkUserId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(
    @Param("boardId") boardId: string,
    @Body(new ZodValidationPipe(createListSchema)) body: CreateListInput,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.listsService.createForUser(boardId, clerkUserId, body);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
// biome-ignore lint/style/useImportType: Nest DI needs ListsService as a runtime constructor token
import { ListsService } from "./lists.service";
import type { CreateListInput } from "./schemas/create-list.schema";
import { createListSchema } from "./schemas/create-list.schema";

@Controller("boards/:boardId/lists")
export class BoardListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  findByBoard(
    @Param("boardId") boardId: string,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.listsService.findByBoardForUser(boardId, clerkUserId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(
    @Param("boardId") boardId: string,
    @Body(new ZodValidationPipe(createListSchema)) body: CreateListInput,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.listsService.createForUser(boardId, clerkUserId, body);
  }
}

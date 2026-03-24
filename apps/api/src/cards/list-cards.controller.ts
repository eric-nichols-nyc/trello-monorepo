import { Controller, Get, Param, Post, Body, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { CardsService } from "./cards.service";
import { createCardSchema } from "./schemas/create-card.schema";
import type { CreateCardInput } from "./schemas/create-card.schema";

@Controller("lists/:listId/cards")
export class ListCardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  findByList(
    @Param("listId") listId: string,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.cardsService.findByListForUser(listId, clerkUserId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(
    @Param("listId") listId: string,
    @Body(new ZodValidationPipe(createCardSchema)) body: CreateCardInput,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.cardsService.createForUser(listId, clerkUserId, body);
  }
}

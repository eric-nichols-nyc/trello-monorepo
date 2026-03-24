import { Controller, Get, Param, Post, Body, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ChecklistsService } from "./checklists.service";
import { createChecklistSchema } from "./schemas/create-checklist.schema";
import type { CreateChecklistInput } from "./schemas/create-checklist.schema";

@Controller("cards/:cardId/checklists")
export class CardChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  findByCard(
    @Param("cardId") cardId: string,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.checklistsService.findByCardForUser(cardId, clerkUserId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(
    @Param("cardId") cardId: string,
    @Body(new ZodValidationPipe(createChecklistSchema)) body: CreateChecklistInput,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.checklistsService.createForUser(cardId, clerkUserId, body);
  }
}

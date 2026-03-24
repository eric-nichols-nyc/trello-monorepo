import { Controller, Get, Param, Post, Body, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { CheckItemsService } from "./check-items.service";
import { createCheckItemSchema } from "./schemas/create-check-item.schema";
import type { CreateCheckItemInput } from "./schemas/create-check-item.schema";

@Controller("checklists/:checklistId/items")
export class ChecklistItemsController {
  constructor(private readonly checkItemsService: CheckItemsService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  findByChecklist(
    @Param("checklistId") checklistId: string,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.checkItemsService.findByChecklistForUser(checklistId, clerkUserId);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  create(
    @Param("checklistId") checklistId: string,
    @Body(new ZodValidationPipe(createCheckItemSchema)) body: CreateCheckItemInput,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.checkItemsService.createForUser(checklistId, clerkUserId, body);
  }
}

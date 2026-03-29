import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { CardsService } from "./cards.service";
import type { UpdateCardDto } from "./dto/update-card.dto";

@Controller("cards")
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  findOne(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.cardsService.findOneForUser(id, clerkUserId);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  update(
    @Param("id") id: string,
    @Body() body: UpdateCardDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.cardsService.updateForUser(id, clerkUserId, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.cardsService.removeForUser(id, clerkUserId);
  }
}

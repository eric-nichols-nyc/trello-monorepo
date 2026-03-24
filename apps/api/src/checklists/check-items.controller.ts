import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { CheckItemsService } from "./check-items.service";
import { UpdateCheckItemDto } from "./dto";

/** Flat resource for a single checklist item (avoids route clashes with `lists`). */
@Controller("checklist-items")
export class CheckItemsController {
  constructor(private readonly checkItemsService: CheckItemsService) {}

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  findOne(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.checkItemsService.findOneForUser(id, clerkUserId);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  update(
    @Param("id") id: string,
    @Body() body: UpdateCheckItemDto,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.checkItemsService.updateForUser(id, clerkUserId, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.checkItemsService.removeForUser(id, clerkUserId);
  }
}

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
import type { UpdateListDto } from "./dto/update-list.dto";
// biome-ignore lint/style/useImportType: Nest DI needs ListsService as a runtime constructor token
import { ListsService } from "./lists.service";

@Controller("lists")
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  findOne(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.listsService.findOneForUser(id, clerkUserId);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  update(
    @Param("id") id: string,
    @Body() body: UpdateListDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.listsService.updateForUser(id, clerkUserId, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.listsService.removeForUser(id, clerkUserId);
  }
}

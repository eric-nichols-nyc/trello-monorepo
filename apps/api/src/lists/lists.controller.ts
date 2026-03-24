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
import { ListsService } from "./lists.service";
import { UpdateListDto } from "./dto";

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
    @CurrentUser("sub") clerkUserId: string,
  ) {
    return this.listsService.updateForUser(id, clerkUserId, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.listsService.removeForUser(id, clerkUserId);
  }
}

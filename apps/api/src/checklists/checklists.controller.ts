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
// biome-ignore lint/style/useImportType: Nest DI needs ChecklistsService as a runtime constructor token
import { ChecklistsService } from "./checklists.service";
// biome-ignore lint/style/useImportType: ValidationPipe needs the class at runtime for @Body() metadata
import { UpdateChecklistDto } from "./dto/update-checklist.dto";

@Controller("checklists")
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  findOne(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.checklistsService.findOneForUser(id, clerkUserId);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  update(
    @Param("id") id: string,
    @Body() body: UpdateChecklistDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.checklistsService.updateForUser(id, clerkUserId, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.checklistsService.removeForUser(id, clerkUserId);
  }
}

import { Controller, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { ClerkAuthGuard } from "../../auth/clerk-auth.guard";
import { CurrentUser } from "../../auth/current-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs the UsersService class reference
import { UsersService } from "../../users/users.service";
import { listBoardTemplateCatalog } from "./registry";

@Controller("board-templates")
export class BoardTemplatesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  async list(@CurrentUser("sub") clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first."
      );
    }
    return listBoardTemplateCatalog();
  }
}

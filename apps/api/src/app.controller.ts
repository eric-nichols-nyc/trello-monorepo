import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Nest DI needs AppService for constructor injection
import { AppService } from "./app.service";
import { ClerkAuthGuard } from "./auth/clerk-auth.guard";
import { CurrentUser } from "./auth/current-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs the UsersService class reference
import { UsersService } from "./users/users.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("health")
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }

  /**
   * Registered on AppController so the route is always bound (same path as before).
   */
  @Get("users/me")
  @UseGuards(ClerkAuthGuard)
  async getCurrentUser(@CurrentUser("sub") clerkUserId: string) {
    const user =
      await this.usersService.findByClerkIdWithWorkspaces(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found in the database after authentication."
      );
    }
    return user;
  }

  @Delete("users/me")
  @UseGuards(ClerkAuthGuard)
  async deleteCurrentUser(@CurrentUser("sub") clerkUserId: string) {
    const deleted = await this.usersService.deleteByClerkId(clerkUserId);
    return {
      ok: true,
      deletedUserId: deleted.id,
      clerkUserId: deleted.clerkUserId,
    };
  }
}

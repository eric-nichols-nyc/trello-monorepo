import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
// biome-ignore lint/style/useImportType: Nest DI needs the UsersService class reference
import { UsersService } from "../users/users.service";
// biome-ignore lint/style/useImportType: DTO classes required at runtime for ValidationPipe metadata
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import type { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import { createWorkspaceSchema } from "./schemas/create-workspace.schema";
// biome-ignore lint/style/useImportType: Nest DI needs the WorkspacesService class reference
import { WorkspacesService } from "./workspaces.service";

@Controller("workspaces")
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  findAll() {
    return this.workspacesService.findAll();
  }

  @Get("mine")
  @UseGuards(ClerkAuthGuard)
  async findMine(@CurrentUser("sub") clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found after authentication (provisioning failed)."
      );
    }
    return this.workspacesService.findByOwnerId(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.workspacesService.findOne(id);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(
    @Body(new ZodValidationPipe(createWorkspaceSchema))
    body: CreateWorkspaceDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found after authentication (provisioning failed)."
      );
    }
    return this.workspacesService.create({ ...body, ownerId: user.id });
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.workspacesService.remove(id);
  }
}

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
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { CurrentUser } from "../auth/current-user.decorator";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
// biome-ignore lint/style/useImportType: Nest DI needs the BoardsService class reference
import { BoardsService } from "./boards.service";
// biome-ignore lint/style/useImportType: DTO classes required at runtime for ValidationPipe metadata
import { CreateBoardDto, UpdateBoardDto } from "./dto";
import { createBoardSchema } from "./schemas/create-board.schema";
// biome-ignore lint/style/useImportType: Nest DI needs the UsersService class reference
import { UsersService } from "../users/users.service";

@Controller("boards")
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  async findAll(@CurrentUser("sub") clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first.",
      );
    }
    return this.boardsService.findAllByUserId(user.id);
  }

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  async findOne(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first.",
      );
    }
    return this.boardsService.findOneByIdForUser(id, user.id);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(
    @Body(new ZodValidationPipe(createBoardSchema)) body: CreateBoardDto,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first.",
      );
    }
    return this.boardsService.createForUser({ ...body, userId: user.id });
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateBoardDto,
    @CurrentUser("sub") clerkUserId: string,
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first.",
      );
    }
    return this.boardsService.updateForUser(id, user.id, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  async remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first.",
      );
    }
    return this.boardsService.removeForUser(id, user.id);
  }
}

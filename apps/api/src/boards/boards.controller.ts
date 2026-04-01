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
// biome-ignore lint/style/useImportType: Nest DI needs the BoardsService class reference
import { BoardsService } from "./boards.service";
// biome-ignore lint/style/useImportType: DTO classes required at runtime for ValidationPipe metadata
import { CreateBoardDto } from "./dto/create-board.dto";
// biome-ignore lint/style/useImportType: DTO class required at runtime for ValidationPipe metadata
import { UpdateBoardDto } from "./dto/update-board.dto";
import { createBoardSchema } from "./schemas/create-board.schema";

@Controller("boards")
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  async findAll(@CurrentUser("sub") clerkUserId: string) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first."
      );
    }
    return this.boardsService.findAllByUserId(user.id);
  }

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  async findOne(
    @Param("id") id: string,
    @CurrentUser("sub") clerkUserId: string
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first."
      );
    }
    return this.boardsService.findOneForUser(id, user.id);
  }

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(
    @Body(new ZodValidationPipe(createBoardSchema)) body: CreateBoardDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first."
      );
    }
    return this.boardsService.createForUser({ ...body, userId: user.id });
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateBoardDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first."
      );
    }
    return this.boardsService.updateForUser(id, user.id, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  async remove(
    @Param("id") id: string,
    @CurrentUser("sub") clerkUserId: string
  ) {
    const user = await this.usersService.findByClerkId(clerkUserId);
    if (!user) {
      throw new NotFoundException(
        "User not found. Sync the Clerk user to the database first."
      );
    }
    return this.boardsService.removeForUser(id, user.id);
  }
}

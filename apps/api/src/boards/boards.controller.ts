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
// biome-ignore lint/style/useImportType: DTO class required at runtime for ValidationPipe metadata
import { CreateBoardDto } from "./dto";
import type { UpdateBoardDto } from "./dto";
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
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.boardsService.findOne(id);
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
    return this.boardsService.create({ ...body, ownerId: user.id });
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateBoardDto) {
    return this.boardsService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.boardsService.remove(id);
  }
}

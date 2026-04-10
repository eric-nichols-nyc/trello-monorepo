import {
  AuthGuard,
  Session,
  UserSession,
} from '@mguay/nestjs-better-auth';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardRequest } from './dto/create-board.request';

@Controller('boards')
@UseGuards(AuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() body: CreateBoardRequest,
  ) {
    return this.boardsService.create(
      session.user.id,
      body.workspaceId,
      body.name,
      {
        shortLink: body.shortLink,
        background: body.background,
        backgroundImage: body.backgroundImage,
      },
    );
  }

  @Get()
  async list(
    @Session() session: UserSession,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.boardsService.findAllInWorkspace(session.user.id, workspaceId);
  }
}

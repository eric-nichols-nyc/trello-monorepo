import {
  AuthGuard,
  Session,
  UserSession,
} from '@mguay/nestjs-better-auth';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateListRequest } from './dto/create-list.request';
import { ListsService } from './lists.service';

@Controller('lists')
@UseGuards(AuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() body: CreateListRequest,
  ) {
    return this.listsService.create(
      session.user.id,
      body.boardId,
      body.name,
      body.pos,
    );
  }

  @Get()
  async list(
    @Session() session: UserSession,
    @Query('boardId') boardId: string,
  ) {
    return this.listsService.findAllOnBoard(session.user.id, boardId);
  }
}

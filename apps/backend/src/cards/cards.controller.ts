import {
  AuthGuard,
  Session,
  UserSession,
} from '@mguay/nestjs-better-auth';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardRequest } from './dto/create-card.request';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() body: CreateCardRequest,
  ) {
    return this.cardsService.create(
      session.user.id,
      body.listId,
      body.name,
      body.description,
      body.pos,
      body.shortLink,
    );
  }

  @Get()
  async list(
    @Session() session: UserSession,
    @Query('listId') listId: string,
  ) {
    return this.cardsService.findAllInList(session.user.id, listId);
  }
}

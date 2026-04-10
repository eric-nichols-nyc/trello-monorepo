import { Module } from '@nestjs/common';
import { KanbanAccessModule } from '../kanban-access/kanban-access.module';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [KanbanAccessModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}

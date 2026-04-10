import { Module } from '@nestjs/common';
import { KanbanAccessModule } from '../kanban-access/kanban-access.module';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({
  imports: [KanbanAccessModule],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}

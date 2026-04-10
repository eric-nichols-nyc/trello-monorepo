import { Module } from '@nestjs/common';
import { KanbanAccessModule } from '../kanban-access/kanban-access.module';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [KanbanAccessModule],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}

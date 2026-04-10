import { Module } from '@nestjs/common';
import { KanbanAccessService } from './kanban-access.service';

@Module({
  providers: [KanbanAccessService],
  exports: [KanbanAccessService],
})
export class KanbanAccessModule {}

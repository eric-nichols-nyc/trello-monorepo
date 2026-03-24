import { Module } from "@nestjs/common";
import { BoardListsController } from "./board-lists.controller";
import { ListsController } from "./lists.controller";
import { ListsService } from "./lists.service";

@Module({
  controllers: [BoardListsController, ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}

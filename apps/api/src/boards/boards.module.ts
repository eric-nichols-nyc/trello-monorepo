import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { BoardsController } from "./boards.controller";
import { BoardsService } from "./boards.service";
import { BoardTemplatesController } from "./templates/board-templates.controller";

@Module({
  imports: [UsersModule],
  controllers: [BoardsController, BoardTemplatesController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}

import { Module } from "@nestjs/common";
import { BoardsController } from "./boards.controller";
import { BoardsService } from "./boards.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}

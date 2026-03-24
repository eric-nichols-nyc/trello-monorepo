import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { CardCommentsController } from "./card-comments.controller";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";

@Module({
  imports: [UsersModule],
  controllers: [CardCommentsController, CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}

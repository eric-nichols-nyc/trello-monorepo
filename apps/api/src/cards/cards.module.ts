import { Module } from "@nestjs/common";
import { UploadsModule } from "../uploads/uploads.module";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { ListCardsController } from "./list-cards.controller";

@Module({
  imports: [UploadsModule],
  controllers: [ListCardsController, CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}

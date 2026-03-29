import { Module } from "@nestjs/common";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";
import { ListCardsController } from "./list-cards.controller";

@Module({
  controllers: [ListCardsController, CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}

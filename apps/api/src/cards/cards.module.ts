import { Module } from "@nestjs/common";
import { ListCardsController } from "./list-cards.controller";
import { CardsController } from "./cards.controller";
import { CardsService } from "./cards.service";

@Module({
  controllers: [ListCardsController, CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}

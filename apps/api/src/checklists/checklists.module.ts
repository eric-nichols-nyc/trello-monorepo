import { Module } from "@nestjs/common";
import { CardChecklistsController } from "./card-checklists.controller";
import { CheckItemsController } from "./check-items.controller";
import { CheckItemsService } from "./check-items.service";
import { ChecklistItemsController } from "./checklist-items.controller";
import { ChecklistsController } from "./checklists.controller";
import { ChecklistsService } from "./checklists.service";

@Module({
  controllers: [
    CardChecklistsController,
    ChecklistsController,
    ChecklistItemsController,
    CheckItemsController,
  ],
  providers: [ChecklistsService, CheckItemsService],
  exports: [ChecklistsService, CheckItemsService],
})
export class ChecklistsModule {}

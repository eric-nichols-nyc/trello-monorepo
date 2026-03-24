import { Module } from "@nestjs/common";
import { ClerkWebhooksController } from "./webhooks.controller";
import { ClerkWebhooksService } from "./webhooks.service";

@Module({
  controllers: [ClerkWebhooksController],
  providers: [ClerkWebhooksService],
})
export class WebhooksModule {}


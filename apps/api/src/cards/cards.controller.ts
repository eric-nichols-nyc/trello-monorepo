import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { memoryStorage } from "multer";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
// biome-ignore lint/style/useImportType: Nest DI needs CardsService as a runtime constructor token
import { CardsService } from "./cards.service";
// biome-ignore lint/style/useImportType: ValidationPipe needs the class at runtime for @Body() metadata
import { CreateAttachmentLinkDto } from "./dto/create-attachment-link.dto";
import { UpdateCardDto } from "./dto/update-card.dto";

const MAX_ATTACHMENT_UPLOAD_BYTES = 25 * 1024 * 1024;

@Controller("cards")
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post(":id/attachments/link")
  @UseGuards(ClerkAuthGuard)
  createAttachmentLink(
    @Param("id") cardKey: string,
    @Body() body: CreateAttachmentLinkDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.cardsService.addAttachmentLinkForUser(
      cardKey,
      clerkUserId,
      body.url,
      body.name
    );
  }

  @Post(":id/attachments")
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_ATTACHMENT_UPLOAD_BYTES },
    })
  )
  async uploadAttachment(
    @Param("id") cardKey: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("name") name: string | undefined,
    @CurrentUser("sub") clerkUserId: string
  ) {
    if (!file?.buffer) {
      throw new BadRequestException(
        'Missing file: send multipart field "file"'
      );
    }
    return this.cardsService.addAttachmentFromUploadForUser(
      cardKey,
      clerkUserId,
      file,
      name
    );
  }

  @Get(":id")
  @UseGuards(ClerkAuthGuard)
  findOne(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.cardsService.findOneForUser(id, clerkUserId);
  }

  @Patch(":id")
  @UseGuards(ClerkAuthGuard)
  update(
    @Param("id") id: string,
    @Body() body: UpdateCardDto,
    @CurrentUser("sub") clerkUserId: string
  ) {
    return this.cardsService.updateForUser(id, clerkUserId, body);
  }

  @Delete(":id")
  @UseGuards(ClerkAuthGuard)
  remove(@Param("id") id: string, @CurrentUser("sub") clerkUserId: string) {
    return this.cardsService.removeForUser(id, clerkUserId);
  }
}

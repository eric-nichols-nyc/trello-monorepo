import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { memoryStorage } from "multer";
import { ClerkAuthGuard } from "../auth/clerk-auth.guard";
import type { CloudinaryService } from "./cloudinary.service";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

@Controller("uploads")
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post("image")
  @UseGuards(ClerkAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file?.buffer) {
      throw new BadRequestException(
        'Missing file: send multipart field "file" with an image'
      );
    }

    try {
      return await this.cloudinaryService.uploadImageBuffer(
        file.buffer,
        file.mimetype
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      throw new BadRequestException(message);
    }
  }
}

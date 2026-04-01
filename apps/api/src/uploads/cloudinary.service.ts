import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
};

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const fromUrl = this.config.get<string>("CLOUDINARY_URL");
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");

    if (fromUrl) {
      return;
    }
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      return;
    }
    throw new Error(
      "Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
    );
  }

  assertImageUpload(mimetype: string, size: number): void {
    if (!ALLOWED_MIME.has(mimetype)) {
      throw new Error(
        `Unsupported image type: ${mimetype}. Allowed: ${[...ALLOWED_MIME].join(", ")}`
      );
    }
    if (size > MAX_BYTES) {
      throw new Error(`Image too large (max ${MAX_BYTES / (1024 * 1024)} MB)`);
    }
  }

  uploadImageBuffer(buffer: Buffer, mimetype: string): Promise<CloudinaryUploadResult> {
    this.assertImageUpload(mimetype, buffer.length);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "trello-api",
          resource_type: "image",
        },
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            reject(new Error("Cloudinary returned an incomplete response"));
            return;
          }
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width ?? 0,
            height: result.height ?? 0,
            format: result.format ?? "",
          });
        }
      );
      Readable.from(buffer).pipe(stream);
    });
  }
}

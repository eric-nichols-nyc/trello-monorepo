import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";

const MAX_BYTES = 5 * 1024 * 1024;

/** Cloudinary callbacks often pass a plain object, not an `Error` — normalize for HTTP + logs. */
function toCloudinaryUploadError(err: unknown): Error {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  if (typeof err === "object" && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.length > 0) {
      return new Error(o.message);
    }
    const nested = o.error;
    if (typeof nested === "object" && nested !== null) {
      const e = nested as Record<string, unknown>;
      if (typeof e.message === "string" && e.message.length > 0) {
        return new Error(e.message);
      }
    }
    if (typeof nested === "string" && nested.length > 0) {
      return new Error(nested);
    }
  }
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error("Cloudinary upload failed");
  }
}

/** Apply `CLOUDINARY_URL` (cloudinary://key:secret@cloud_name) — do not rely on implicit SDK env reads in Nest. */
function configFromCloudinaryUrl(url: string): void {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("CLOUDINARY_URL is empty");
  }
  const forParse = /^cloudinary:/i.test(trimmed)
    ? trimmed.replace(/^cloudinary:/i, "https:")
    : trimmed;
  let parsed: URL;
  try {
    parsed = new URL(forParse);
  } catch {
    throw new Error("CLOUDINARY_URL is not a valid URL");
  }
  const apiKey = parsed.username ? decodeURIComponent(parsed.username) : "";
  const apiSecret = parsed.password ? decodeURIComponent(parsed.password) : "";
  const cloudName = parsed.hostname;
  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error(
      "CLOUDINARY_URL must be cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}
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

    if (fromUrl?.trim()) {
      configFromCloudinaryUrl(fromUrl);
      return;
    }
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
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
      const fail = (e: unknown) => reject(toCloudinaryUploadError(e));

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "trellnode",
          resource_type: "image",
        },
        (err, result) => {
          if (err) {
            fail(err);
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            fail(new Error("Cloudinary returned an incomplete response"));
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

      stream.on("error", fail);
      Readable.from(buffer).pipe(stream);
    });
  }
}

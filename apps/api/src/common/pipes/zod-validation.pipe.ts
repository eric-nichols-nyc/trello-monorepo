import type { PipeTransform } from "@nestjs/common";
import { BadRequestException, Injectable } from "@nestjs/common";
import type { z } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(value: unknown) {
    if (value === undefined || value === null) {
      throw new BadRequestException(
        'Request body is required. Send JSON with "name", "workspaceId" (UUID), and header: Content-Type: application/json'
      );
    }
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    const first = result.error.issues[0];
    const path = first?.path?.join(".") ?? "";
    let message: string;
    if (first) {
      if (path && path.length > 0) {
        message = `${path}: ${first.message}`;
      } else {
        message = first.message;
      }
    } else {
      message = "Validation failed";
    }
    throw new BadRequestException(message);
  }
}

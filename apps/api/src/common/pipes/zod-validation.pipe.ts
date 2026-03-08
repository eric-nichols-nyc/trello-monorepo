import { BadRequestException, Injectable } from "@nestjs/common";
import type { PipeTransform } from "@nestjs/common";
import type { z } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(value: unknown) {
    if (value === undefined || value === null) {
      throw new BadRequestException(
        'Request body is required. Send JSON with a "title" field and header: Content-Type: application/json',
      );
    }
    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }
    const first = result.error.issues[0];
    const path = first?.path?.join(".") ?? "";
    const message = first
      ? (path ? `${path}: ${first.message}` : first.message)
      : "Validation failed";
    throw new BadRequestException(message);
  }
}

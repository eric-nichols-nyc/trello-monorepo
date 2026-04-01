import { instanceToPlain } from "class-transformer";

import type { Prisma } from "../../../generated/prisma/client";
import type { UpdateBoardDto } from "./update-board.dto";

/** Only these keys may appear in `BoardUpdateInput`; everything else is dropped. */
const BOARD_UPDATE_KEYS = [
  "name",
  "shortLink",
  "background",
  "backgroundImage",
  "backgroundBrightness",
  "backgroundBottomColor",
  "backgroundTopColor",
  "backgroundColor",
  "starred",
  "closed",
] as const satisfies ReadonlyArray<keyof Prisma.BoardUpdateInput>;

/**
 * Nest hands you a `UpdateBoardDto` class instance. Prisma needs a plain object
 * of scalars — never pass the DTO instance (or ad‑hoc `dto.field` reads that
 * can still see polluted own props). `instanceToPlain` plus an explicit
 * whitelist avoids "[object Function]" / serialization failures.
 */
export function updateBoardDtoToPrismaData(
  dto: UpdateBoardDto,
): Prisma.BoardUpdateInput {
  const plain = instanceToPlain(dto) as Record<string, unknown>;
  const data: Prisma.BoardUpdateInput = {};

  for (const key of BOARD_UPDATE_KEYS) {
    if (!Object.hasOwn(plain, key)) {
      continue;
    }
    const value = plain[key];
    if (value === undefined || typeof value === "function") {
      continue;
    }
    (data as Record<string, unknown>)[key] = value;
  }

  return data;
}

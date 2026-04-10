import { randomBytes } from "node:crypto";

/** Base62-style mix (case-sensitive), similar to Trello short links. */
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Random URL slug for `Workspace.shortLink` / `Board.shortLink` / `Card.shortLink` (default 8 chars).
 * Allocate on create via services unless the client sends `shortLink`.
 * Legacy rows may keep `shortLink: null` and stay addressable by primary `id`.
 */
export function randomShortLink(length = 8): string {
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    const b = buf[i] ?? 0;
    out += ALPHABET[b % ALPHABET.length] ?? "0";
  }
  return out;
}

/**
 * Resolves a slug not yet present for the given table (checks via `isTaken`).
 */
export async function allocateUniqueShortLink(
  isTaken: (slug: string) => Promise<boolean>,
  options?: { length?: number; maxAttempts?: number },
): Promise<string> {
  const length = options?.length ?? 8;
  const maxAttempts = options?.maxAttempts ?? 16;
  for (let i = 0; i < maxAttempts; i++) {
    const slug = randomShortLink(length);
    if (!(await isTaken(slug))) return slug;
  }
  throw new Error("Failed to allocate unique short link");
}

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

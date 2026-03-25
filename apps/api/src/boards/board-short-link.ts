import { randomBytes } from "node:crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** URL-safe, Trello-ish short id (default 8 chars). */
export function randomBoardShortLink(length = 8): string {
  const buf = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    const b = buf[i] ?? 0;
    out += ALPHABET[b % ALPHABET.length] ?? "0";
  }
  return out;
}

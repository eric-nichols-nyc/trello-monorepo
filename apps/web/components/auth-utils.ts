/** Allow only same-origin relative paths for post-auth redirects. */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

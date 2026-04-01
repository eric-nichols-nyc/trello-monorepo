/** Browser-visible Nest origin; pair with `Authorization: Bearer` from Clerk `getToken()`. */
export function nestPublicBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set (Nest base URL, e.g. http://localhost:3001)"
    );
  }
  return raw.replace(/\/$/, "");
}

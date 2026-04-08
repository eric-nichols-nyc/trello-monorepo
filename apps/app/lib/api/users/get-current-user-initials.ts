import type { PersonNameFields } from "@/lib/user/user-initials";
import { initialsFromPersonNameFields } from "@/lib/user/user-initials";

import { getMe } from "./me";

/**
 * Narrows Nest `GET /users/me` (Prisma `User`) to the fields used for initials.
 */
function personFieldsFromMeResponse(raw: unknown): PersonNameFields | null {
  if (raw === null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const email = o.email;
  if (typeof email !== "string") {
    return null;
  }
  return {
    email,
    firstName: typeof o.firstName === "string" ? o.firstName : null,
    lastName: typeof o.lastName === "string" ? o.lastName : null,
    fullName: null,
  };
}

/**
 * Server-only: one Nest round-trip for the signed-in user, then initials from DB-backed
 * `firstName` / `lastName` / `email` (aligned with Clerk-backed fields synced into `User`).
 *
 * Prefer this over TanStack `useQuery` for `me` here: the workspace layout already gates on Nest, so we hydrate
 * initials once and expose them through `WorkspaceShellProvider` instead of a client waterfall.
 */
export async function getCurrentUserInitialsFromApi(): Promise<string> {
  try {
    const raw = await getMe();
    const fields = personFieldsFromMeResponse(raw);
    if (fields === null) {
      return "?";
    }
    return initialsFromPersonNameFields(fields);
  } catch {
    return "?";
  }
}

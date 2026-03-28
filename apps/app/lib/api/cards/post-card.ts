import { auth } from "@repo/clerk/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

/**
 * Server-only: `POST` a new card on Nest (`ListCardsController#create`).
 *
 * Forwards to `POST {API_URL}/api/lists/:listId/cards` with the Clerk session
 * token — same auth pattern as `patchBoard` / `getBoard`.
 *
 * `body` should match Nest’s Zod `createCardSchema` (at minimum `{ name }`).
 */
export async function postCard(
  listId: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not set");
  }

  const response = await fetch(
    `${baseUrl}/api/lists/${encodeURIComponent(listId)}/cards`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

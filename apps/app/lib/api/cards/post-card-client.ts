import { BoardApiError } from "@/lib/api/boards/board-api-error";
import type { CreateCardInput } from "@repo/schemas";

/**
 * Browser-safe `POST` to the Next proxy at `/api/lists/:listId/cards`.
 *
 * Does **not** import server-only modules (`postCard`, Clerk, `API_URL`).
 * Pair with `useCreateCard` (Step 5) and validate payloads with `createCardSchema`
 * in the form before calling this.
 */
export async function postCardClient(
  listId: string,
  body: CreateCardInput
): Promise<unknown> {
  const response = await fetch(
    `/api/lists/${encodeURIComponent(listId)}/cards`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

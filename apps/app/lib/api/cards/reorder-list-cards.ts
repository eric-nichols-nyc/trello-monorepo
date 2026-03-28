import { auth } from "@repo/clerk/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

/**
 * Server-only: rebalance / reorder cards in a list (`PATCH …/lists/:listId/cards/positions`).
 */
export async function reorderListCards(
  listId: string,
  cardIds: string[]
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
    `${baseUrl}/api/lists/${encodeURIComponent(listId)}/cards/positions`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cardIds }),
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

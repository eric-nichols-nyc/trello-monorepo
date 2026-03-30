/**
 * Browser-safe `DELETE` to the Next proxy at `/api/cards/:cardId`.
 */
import { BoardApiError } from "@/lib/api/boards/board-api-error";

export async function deleteCardClient(cardId: string): Promise<unknown> {
  const response = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

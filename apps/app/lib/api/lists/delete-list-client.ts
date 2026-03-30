/**
 * Browser-safe `DELETE` to the Next proxy at `/api/lists/:listId`.
 */
import { BoardApiError } from "@/lib/api/boards/board-api-error";

export async function deleteListClient(listId: string): Promise<unknown> {
  const response = await fetch(`/api/lists/${encodeURIComponent(listId)}`, {
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

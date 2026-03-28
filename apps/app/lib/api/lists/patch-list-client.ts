/**
 * Browser client for list PATCH. Posts to Next `/api/lists/:listId`, which
 * attaches the Clerk session and proxies to Nest (see `patch-list.ts`).
 */
import { BoardApiError } from "@/lib/api/boards/board-api-error";

/** Subset of Nest `UpdateListDto` exposed to the app shell. */
export type UpdateListPatchBody = {
  /** Column display order; fractional values allowed (midpoint between neighbors). */
  pos?: number;
  name?: string;
  closed?: boolean;
};

/** Same-origin `fetch`; throws {@link BoardApiError} when the response is not OK. */
export async function patchListClient(
  listId: string,
  body: UpdateListPatchBody
): Promise<unknown> {
  const response = await fetch(`/api/lists/${encodeURIComponent(listId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

/** Subset of Nest `UpdateCardDto` supported by the app client. */
export type UpdateCardBody = {
  description?: string;
  /** Checkbox “done” on the card. */
  completed?: boolean;
  /** Due date as ISO string; `null` clears. */
  dueDate?: string | null;
  /** Archive card (distinct from `completed`). */
  closed?: boolean;
  /** Image URL cover; server clears `coverColor` when set. */
  coverImage?: string | null;
  /** Solid color cover; server clears `coverImage` when set. */
  coverColor?: string | null;
};

/** PATCH `/api/cards/:id` for metadata updates (not move-only `patchCardClient`). */
export async function updateCardClient(
  cardId: string,
  body: UpdateCardBody,
  token: string,
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/cards/${encodeURIComponent(cardId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

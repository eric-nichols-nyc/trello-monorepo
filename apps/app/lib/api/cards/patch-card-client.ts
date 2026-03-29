import type { MoveCardPatchInput } from "@repo/schemas";
import { moveCardPatchSchema } from "@repo/schemas";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

export async function patchCardClient(
  cardId: string,
  body: MoveCardPatchInput
): Promise<unknown> {
  const parsed = moveCardPatchSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const response = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
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

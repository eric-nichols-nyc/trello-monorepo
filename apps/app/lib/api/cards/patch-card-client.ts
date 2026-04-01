import type { MoveCardPatchInput } from "@repo/schemas";
import { moveCardPatchSchema } from "@repo/schemas";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

export async function patchCardClient(
  cardId: string,
  body: MoveCardPatchInput,
  token: string
): Promise<unknown> {
  const parsed = moveCardPatchSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const response = await fetch(
    `${nestPublicBaseUrl()}/api/cards/${encodeURIComponent(cardId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
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

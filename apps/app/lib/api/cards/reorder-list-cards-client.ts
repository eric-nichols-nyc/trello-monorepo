import type { ReorderListCardsInput } from "@repo/schemas";
import { reorderListCardsSchema } from "@repo/schemas";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

export async function reorderListCardsClient(
  listId: string,
  body: ReorderListCardsInput
): Promise<unknown> {
  const parsed = reorderListCardsSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const response = await fetch(
    `/api/lists/${encodeURIComponent(listId)}/cards/positions`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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

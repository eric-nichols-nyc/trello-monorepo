import type { CreateListInput } from "@repo/schemas";
import { createListSchema } from "@repo/schemas";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

export async function postListClient(
  boardId: string,
  body: CreateListInput
): Promise<unknown> {
  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const response = await fetch(
    `/api/boards/id/${encodeURIComponent(boardId)}/lists`,
    {
      method: "POST",
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

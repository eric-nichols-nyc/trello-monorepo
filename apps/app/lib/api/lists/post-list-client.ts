import type { CreateListInput } from "@repo/schemas";
import { createListSchema } from "@repo/schemas";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

/** POST `/api/boards/:boardId/lists` on Nest; pass `await useAuth().getToken()`. */
export async function postListClient(
  boardId: string,
  body: CreateListInput,
  token: string
): Promise<unknown> {
  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const response = await fetch(
    `${nestPublicBaseUrl()}/api/boards/${encodeURIComponent(boardId)}/lists`,
    {
      method: "POST",
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

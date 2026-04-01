import type { CreateCardInput } from "@repo/schemas";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

export async function postCardClient(
  listId: string,
  body: CreateCardInput,
  token: string
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/lists/${encodeURIComponent(listId)}/cards`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

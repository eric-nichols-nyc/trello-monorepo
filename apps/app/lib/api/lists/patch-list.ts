/**
 * Server-side Nest client for list updates. Used by the Next route handler at
 * `app/api/lists/[listId]/route.ts`; do not import from client components.
 *
 * @see {@link patchListClient} for browser calls through the same-origin proxy.
 */
import { auth } from "@repo/clerk/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

/** Forwards JSON body to Nest `ListsController.update` (`PATCH /api/lists/:id`). */
export async function patchList(
  listId: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not set");
  }

  const response = await fetch(
    `${baseUrl}/api/lists/${encodeURIComponent(listId)}`,
    {
      method: "PATCH",
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

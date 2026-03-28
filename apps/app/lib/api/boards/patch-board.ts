import { auth } from "@repo/clerk/server";

import { BoardApiError } from "./board-api-error";

/**
 * Server-only: PATCH board on Nest. `boardId` must be the board UUID (Nest
 * `updateForUser` matches on `id`, not `shortLink`).
 */
export async function patchBoard(
  boardId: string,
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
    `${baseUrl}/api/boards/${encodeURIComponent(boardId)}`,
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

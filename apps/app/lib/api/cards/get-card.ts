import { auth } from "@repo/clerk/server";

import { BoardApiError } from "../boards/board-api-error";

export async function getCard(cardKey: string): Promise<unknown> {
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
    `${baseUrl}/api/cards/${encodeURIComponent(cardKey)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
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

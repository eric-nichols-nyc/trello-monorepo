import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

export async function deleteCardClient(
  cardId: string,
  token: string
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/cards/${encodeURIComponent(cardId)}`,
    {
      method: "DELETE",
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

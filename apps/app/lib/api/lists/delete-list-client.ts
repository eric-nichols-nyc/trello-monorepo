import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

/** DELETE `/api/lists/:id` on Nest; pass `await useAuth().getToken()`. */
export async function deleteListClient(
  listId: string,
  token: string
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/lists/${encodeURIComponent(listId)}`,
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

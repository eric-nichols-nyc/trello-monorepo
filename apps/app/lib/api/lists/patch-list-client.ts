import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

/** Subset of Nest `UpdateListDto` for browser calls. */
export type UpdateListPatchBody = {
  pos?: number;
  name?: string;
  closed?: boolean;
};

/** PATCH `/api/lists/:id` on Nest; pass `await useAuth().getToken()`. */
export async function patchListClient(
  listId: string,
  body: UpdateListPatchBody,
  token: string
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/lists/${encodeURIComponent(listId)}`,
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

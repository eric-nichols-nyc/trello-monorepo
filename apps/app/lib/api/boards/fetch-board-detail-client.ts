import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";
import {
  type BoardDetail,
  normalizeBoardDetailPayload,
} from "@/types/board-detail";

/** GET `/api/boards/:boardKey` on Nest; pass `await useAuth().getToken()`. */
export async function fetchBoardDetailClient(
  boardKey: string,
  token: string
): Promise<BoardDetail> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/boards/${encodeURIComponent(boardKey)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    throw new BoardApiError(404, await response.text());
  }

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }

  const raw: unknown = await response.json();
  return normalizeBoardDetailPayload(raw);
}

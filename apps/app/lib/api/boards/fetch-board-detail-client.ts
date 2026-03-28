import { BoardApiError } from "@/lib/api/boards/board-api-error";
import {
  type BoardDetail,
  normalizeBoardDetailPayload,
} from "@/types/board-detail";

/** Browser-safe fetch: calls the Next.js route under `/api/boards/...`. */
export async function fetchBoardDetailClient(
  boardKey: string
): Promise<BoardDetail> {
  const response = await fetch(`/api/boards/${encodeURIComponent(boardKey)}`, {
    cache: "no-store",
  });

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

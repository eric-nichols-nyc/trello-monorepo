import { BoardApiError } from "@/lib/api/boards/board-api-error";

export type UpdateBoardPatchBody = {
  name?: string;
  shortLink?: string;
  starred?: boolean;
  closed?: boolean;
  background?: string | null;
  backgroundImage?: string | null;
  backgroundBrightness?: "light" | "dark";
  backgroundBottomColor?: string | null;
  backgroundTopColor?: string | null;
  backgroundColor?: string | null;
};

/** Browser-safe PATCH via Next route `/api/boards/id/:boardId`. */
export async function patchBoardClient(
  boardId: string,
  body: UpdateBoardPatchBody
): Promise<unknown> {
  const response = await fetch(
    `/api/boards/id/${encodeURIComponent(boardId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

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

/** PATCH `/api/boards/:id` on Nest; pass `await useAuth().getToken()`. */
export async function patchBoardClient(
  boardId: string,
  body: UpdateBoardPatchBody,
  token: string,
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/boards/${encodeURIComponent(boardId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

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

function nestBoardsBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw || raw.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Use your Nest base URL (same as API_URL), e.g. http://localhost:3001",
    );
  }
  return raw.replace(/\/$/, "");
}

/**
 * PATCH board on Nest (`PATCH /api/boards/:id`). Call from the browser with a
 * Clerk session token from `useAuth().getToken()`.
 */
export async function patchBoardClient(
  boardId: string,
  body: UpdateBoardPatchBody,
  token: string,
): Promise<unknown> {
  const response = await fetch(
    `${nestBoardsBaseUrl()}/api/boards/${encodeURIComponent(boardId)}`,
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

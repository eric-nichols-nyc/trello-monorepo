import type { CSSProperties } from "react";

import type { BoardDetail } from "@/types/board-detail";

export const DEFAULT_BOARD_BACKGROUND_IMAGE =
  "/photo-1521495084171-3ad639e3d525.jpg";

export type BoardBackgroundStyleSource = Pick<
  BoardDetail,
  "backgroundImage" | "backgroundColor"
>;

/** Inline styles for the board shell or a small preview — matches `TrelloBoard` background logic. */
export function getBoardBackgroundStyle(
  board: BoardBackgroundStyleSource
): CSSProperties {
  const imageUrl = board.backgroundImage?.trim();
  if (imageUrl) {
    return { backgroundImage: `url(${JSON.stringify(imageUrl)})` };
  }

  const colorHex = board.backgroundColor?.trim();
  if (colorHex) {
    return { backgroundColor: colorHex };
  }

  return {
    backgroundImage: `url(${JSON.stringify(DEFAULT_BOARD_BACKGROUND_IMAGE)})`,
  };
}

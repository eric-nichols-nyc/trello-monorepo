import type { CSSProperties } from "react";

import type { BoardDetail } from "@/types/board-detail";

import { BoardView } from "./board-view";

const DEFAULT_BOARD_BACKGROUND_IMAGE = "/photo-1521495084171-3ad639e3d525.jpg";

function boardShellStyle(board: BoardDetail): CSSProperties {
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

type TrelloBoardProps = {
  /** Comes from `BoardPageContent` → `useBoardDetail`’s `data` (cached board). */
  board: BoardDetail;
  /** URL segment for React Query (`useBoardDetail` / `useUpdateBoard` invalidation). */
  boardKey: string;
};

/** Shell layout + background; no fetching — passes `board` into `BoardView`. */
export const TrelloBoard = ({ board, boardKey }: TrelloBoardProps) => (
  <div
    className="flex min-h-0 min-w-0 flex-1 flex-col bg-center bg-cover bg-no-repeat"
    style={boardShellStyle(board)}
  >
    <BoardView board={board} boardKey={boardKey} />
  </div>
);

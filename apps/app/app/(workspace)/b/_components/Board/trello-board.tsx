import { getBoardBackgroundStyle } from "@/lib/board/get-board-background-style";
import type { BoardDetail } from "@/types/board-detail";

import { IslandNav } from "../IslandNav/island-nav";
import { BoardView } from "./board-view";

type TrelloBoardProps = {
  /** Comes from `BoardPageContent` → `useBoardDetail`’s `data` (cached board). */
  board: BoardDetail;
  /** URL segment for React Query (`useBoardDetail` / `useUpdateBoard` invalidation). */
  boardKey: string;
};

/** Shell layout + background; no fetching — passes `board` into `BoardView`. */
export const TrelloBoard = ({ board, boardKey }: TrelloBoardProps) => (
  <div
    className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-center bg-cover bg-no-repeat"
    style={getBoardBackgroundStyle(board)}
  >
    <BoardView board={board} boardKey={boardKey} />
    <IslandNav boardKey={boardKey} />
  </div>
);

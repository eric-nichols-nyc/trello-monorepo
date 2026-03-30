import type { BoardDetail } from "@/types/board-detail";

import { BoardLists } from "./board-lists";

type BoardListViewProps = {
  /** Full board so lists + cards stay in sync with the cached query payload. */
  board: BoardDetail;
  boardKey: string;
};

/** Scroll container only; defers structure/DnD to `BoardLists`. */
export const BoardListView = ({ board, boardKey }: BoardListViewProps) => (
  <div className="mt-[12px] min-h-0 min-w-0 flex-1 overflow-auto px-[15px]">
    <BoardLists board={board} boardKey={boardKey} />
  </div>
);

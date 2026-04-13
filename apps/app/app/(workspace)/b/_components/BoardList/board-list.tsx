import type { BoardDetail } from "@/types/board-detail";

import { BoardLists } from "./board-lists";

type BoardListProps = {
  /** Full board so lists + cards stay in sync with the cached query payload. */
  board: BoardDetail;
  boardKey: string;
};

/** Horizontal scroll; vertical overflow is handled inside each list column. */
export const BoardList = ({ board, boardKey }: BoardListProps) => (
  <div className="mt-[12px] flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto overflow-y-hidden px-[15px]">
    <BoardLists board={board} boardKey={boardKey} />
  </div>
);

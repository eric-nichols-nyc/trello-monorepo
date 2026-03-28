import type { BoardDetail } from "@/types/board-detail";

import { BoardLists } from "./board-lists";

type BoardListViewProps = {
  board: BoardDetail;
};

export const BoardListView = ({ board }: BoardListViewProps) => (
  <div className="mt-[12px] min-h-0 min-w-0 flex-1 overflow-auto px-[15px]">
    <BoardLists board={board} />
  </div>
);

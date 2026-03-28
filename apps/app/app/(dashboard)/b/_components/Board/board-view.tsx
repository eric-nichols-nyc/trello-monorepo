import type { BoardDetail } from "@/types/board-detail";

import { BoardListView } from "../BoardListView/board-list-view";
import { BoardHeader } from "../BoardHeader/board-header";

type BoardViewProps = {
  board: BoardDetail;
};

export const BoardView = ({ board }: BoardViewProps) => (
  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <BoardHeader boardName={board.name} />
    <BoardListView board={board} />
  </div>
);

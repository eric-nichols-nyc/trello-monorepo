import { BoardListView } from "../BoardListView/board-list-view";
import { BoardHeader } from "../BoardHeader/board-header";

export const BoardView = () => (
  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <BoardHeader />
    <BoardListView />
  </div>
);

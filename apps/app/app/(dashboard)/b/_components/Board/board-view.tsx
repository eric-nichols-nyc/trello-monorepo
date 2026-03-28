import type { BoardDetail } from "@/types/board-detail";

import { BoardListView } from "../BoardListView/board-list-view";
import { BoardHeader } from "../BoardHeader/board-header";

type BoardViewProps = {
  /** Same `board` object flowing down from `TrelloBoard` (query result). */
  board: BoardDetail;
  boardKey: string;
};

/** Splits header vs list regions; still no hooks — only props. */
export const BoardView = ({ board, boardKey }: BoardViewProps) => (
  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <BoardHeader
      boardId={board.id}
      boardKey={boardKey}
      boardName={board.name}
    />
    <BoardListView board={board} />
  </div>
);

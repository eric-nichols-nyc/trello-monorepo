import type { BoardDetail } from "@/types/board-detail";
import { BoardHeader } from "../BoardHeader/board-header";
import { BoardListView } from "../BoardListView/board-list-view";

type BoardViewProps = {
  /** Same `board` object flowing down from `TrelloBoard` (query result). */
  board: BoardDetail;
  boardKey: string;
};

/** Splits header vs list regions; still no hooks — only props. */
export const BoardView = ({ board, boardKey }: BoardViewProps) => (
  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
    <BoardHeader
      boardBackground={{
        backgroundColor: board.backgroundColor,
        backgroundImage: board.backgroundImage,
      }}
      boardId={board.id}
      boardKey={boardKey}
      boardName={board.name}
      starred={board.starred}
      workspaceId={board.workspaceId}
    />
    <BoardListView board={board} boardKey={boardKey} />
  </div>
);

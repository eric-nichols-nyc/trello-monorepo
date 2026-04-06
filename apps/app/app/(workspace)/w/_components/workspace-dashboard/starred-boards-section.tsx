import { Star } from "lucide-react";
import { getStableBoardKey } from "@/lib/boards/board-list-utils";
import { BoardTile } from "../board-tile/board-tile";
import { WorkspaceHeader } from "../workspace-header/workspace-header";

type StarredBoardsSectionProperties = {
  readonly boards: readonly unknown[];
};

/**
 * Workspace-scoped starred boards (caller passes only starred rows).
 * Render nothing when `boards` is empty.
 */
export const StarredBoardsSection = ({
  boards,
}: StarredBoardsSectionProperties) => {
  if (boards.length === 0) {
    return null;
  }

  const list = [...boards];

  return (
    <section
      aria-labelledby="workspace-starred-boards-heading"
      className="space-y-4"
    >
      <WorkspaceHeader
        id="workspace-starred-boards-heading"
        leading={
          <Star
            aria-hidden
            className="size-5 shrink-0 fill-amber-400 text-amber-400"
            strokeWidth={2}
          />
        }
        title="Starred boards"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((board, index) => (
          <BoardTile board={board} key={getStableBoardKey(board, index)} />
        ))}
      </div>
    </section>
  );
};

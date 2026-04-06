import { CircleUser } from "lucide-react";
import { getStableBoardKey } from "@/lib/boards/board-list-utils";
import { BoardTile } from "../board-tile/board-tile";
import { CreateNewBoardButton } from "../CreateNewBoardButton/create-new-board-button";
import { WorkspaceHeader } from "../workspace-header/workspace-header";

type WorkspaceBoardsHomeProperties = {
  readonly boards: readonly unknown[];
  readonly heading?: string;
  readonly workspaceId: string | null;
};

export const WorkspaceBoardsHome = ({
  boards,
  heading = "Your boards",
  workspaceId,
}: WorkspaceBoardsHomeProperties) => {
  const list = [...boards];

  return (
    <section
      aria-labelledby="workspace-boards-home-heading"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WorkspaceHeader
          id="workspace-boards-home-heading"
          leading={
            <CircleUser
              aria-hidden
              className="size-5 shrink-0 text-muted-foreground"
              strokeWidth={2}
            />
          }
          title={heading}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((board, index) => (
          <BoardTile board={board} key={getStableBoardKey(board, index)} />
        ))}
        <CreateNewBoardButton workspaceId={workspaceId} />
      </div>
    </section>
  );
};

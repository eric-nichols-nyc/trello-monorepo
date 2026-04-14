"use client";

import { CircleUser } from "lucide-react";
import { useMemo } from "react";
import {
  filterStarredBoardsSorted,
  filterUnstarredBoardsSorted,
  getStableBoardKey,
} from "@/lib/boards/board-list-utils";
import { BoardTile } from "../board-tile/board-tile";
import { CreateNewBoardTile } from "../createNewBoardTile/create-new-board-tile";
import { WorkspaceHeader } from "../workspace-header/workspace-header";
import { StarredBoardsSection } from "./starred-boards-section";

type WorkspaceBoardsWorkspacePanelProperties = {
  readonly boards: readonly unknown[];
  readonly workspaceId: string | null;
};

export const WorkspaceBoardsWorkspacePanel = ({
  boards,
  workspaceId,
}: WorkspaceBoardsWorkspacePanelProperties) => {
  const starredBoards = useMemo(
    () => filterStarredBoardsSorted(boards),
    [boards]
  );

  const unstarredBoards = useMemo(
    () => filterUnstarredBoardsSorted(boards),
    [boards]
  );

  return (
    <div className="space-y-10">
      <StarredBoardsSection boards={starredBoards} />

      <section
        aria-labelledby="workspace-boards-main-heading"
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <WorkspaceHeader
            id="workspace-boards-main-heading"
            leading={
              <CircleUser
                aria-hidden
                className="size-5 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
            }
            title="Your boards"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {unstarredBoards.map((board, index) => (
            <BoardTile board={board} key={getStableBoardKey(board, index)} />
          ))}
          <CreateNewBoardTile workspaceId={workspaceId} />
        </div>
      </section>
    </div>
  );
};

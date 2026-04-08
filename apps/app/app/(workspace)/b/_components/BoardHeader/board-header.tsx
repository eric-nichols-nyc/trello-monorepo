import type { BoardBackgroundStyleSource } from "@/lib/board/get-board-background-style";

import { BoardHeaderOptions } from "../BoardHeaderOptions/board-header-options";
import { BoardMenuButton } from "../BoardMenuPopover/board-menu-button";
import { BoardName } from "../BoardName/board-name";

type BoardHeaderProps = {
  boardBackground: BoardBackgroundStyleSource;
  boardId: string;
  boardKey: string;
  boardName: string;
  starred: boolean;
  workspaceId: string;
};

export const BoardHeader = ({
  boardBackground,
  boardId,
  boardKey,
  boardName,
  starred,
  workspaceId,
}: BoardHeaderProps) => (
  <header className="relative p-[12px] js-board-header">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-black/40"
    />
    <div className="relative z-10 flex min-w-0 items-center justify-between gap-2 sm:gap-3">
      <div className="min-w-0 flex-1">
        <BoardName boardId={boardId} boardKey={boardKey} name={boardName} />
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
        <BoardHeaderOptions
          boardId={boardId}
          boardKey={boardKey}
          starred={starred}
          workspaceId={workspaceId}
        />
        <BoardMenuButton
          boardBackground={boardBackground}
          boardId={boardId}
          boardKey={boardKey}
          boardName={boardName}
        />
      </div>
    </div>
  </header>
);

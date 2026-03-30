import type { BoardBackgroundStyleSource } from "@/lib/board/get-board-background-style";

import { BoardMenuButton } from "../BoardMenuPopover/board-menu-button";
import { BoardName } from "../BoardName/board-name";

type BoardHeaderProps = {
  boardBackground: BoardBackgroundStyleSource;
  boardId: string;
  boardKey: string;
  boardName: string;
};

export const BoardHeader = ({
  boardBackground,
  boardId,
  boardKey,
  boardName,
}: BoardHeaderProps) => (
  <header className="relative p-[12px]">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-black/40"
    />
    <div className="relative z-10 flex min-w-0 items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <BoardName boardId={boardId} boardKey={boardKey} name={boardName} />
      </div>
      <BoardMenuButton
        boardBackground={boardBackground}
        boardName={boardName}
      />
    </div>
  </header>
);

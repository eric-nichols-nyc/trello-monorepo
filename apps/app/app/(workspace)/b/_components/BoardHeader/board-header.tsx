import { BoardMenuButton } from "../BoardMenuPopover/board-menu-button";
import { BoardName } from "../BoardName/board-name";

type BoardHeaderProps = {
  boardId: string;
  boardKey: string;
  boardName: string;
};

export const BoardHeader = ({
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
      <BoardMenuButton boardName={boardName} />
    </div>
  </header>
);

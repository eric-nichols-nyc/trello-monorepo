import { BoardName } from "../BoardName/board-name";

type BoardHeaderProps = {
  boardName: string;
};

export const BoardHeader = ({ boardName }: BoardHeaderProps) => (
  <header className="relative p-[12px]">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-black/40"
    />
    <div className="relative z-10">
      <BoardName name={boardName} />
    </div>
  </header>
);

import { BoardTile } from "./_components/board-tile/board-tile";
import { DUMMY_BOARDS } from "./Test Data/dummy-boards";

const getBoardKey = (board: unknown, index: number): string => {
  if (
    board !== null &&
    typeof board === "object" &&
    "id" in board &&
    typeof (board as { id: unknown }).id === "string"
  ) {
    return (board as { id: string }).id;
  }
  return `board-${index}`;
};

export default function DashboardPage() {
  const list = [...DUMMY_BOARDS];

  return (
    <div className="mx-auto grid max-w-[914px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((board, index) => (
        <BoardTile board={board} key={getBoardKey(board, index)} />
      ))}
    </div>
  );
}

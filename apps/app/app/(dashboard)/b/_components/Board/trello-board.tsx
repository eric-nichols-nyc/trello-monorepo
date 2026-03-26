import { BoardView } from "./board-view";

const boardBackgroundImage = "url(/photo-1521495084171-3ad639e3d525.jpg)";

export const TrelloBoard = () => (
  <div
    className="flex min-h-0 min-w-0 flex-1 flex-col bg-center bg-cover bg-no-repeat"
    style={{ backgroundImage: boardBackgroundImage }}
  >
    <BoardView />
  </div>
);

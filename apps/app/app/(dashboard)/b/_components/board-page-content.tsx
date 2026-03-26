"use client";

import { useBoardDetailSample } from "@/queries/use-board-detail-sample";

import { TrelloBoard } from "./Board/trello-board";

type BoardPageContentProps = {
  boardId: string;
};

export function BoardPageContent({ boardId }: BoardPageContentProps) {
  const { data, isPending, isError, error } = useBoardDetailSample();

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center text-white/80">
        Loading board…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center text-red-300">
        {error instanceof Error ? error.message : "Failed to load board"}
      </div>
    );
  }

  // Sample JSON is a single fixture; wire `boardId` to a real API when ready.
  void boardId;

  return <TrelloBoard board={data} />;
}

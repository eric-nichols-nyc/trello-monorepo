"use client";

import { useBoardDetail } from "@/queries/use-board-detail";
import type { BoardDetail } from "@/types/board-detail";

import { TrelloBoard } from "./Board/trello-board";

type BoardPageContentProperties = {
  /** Route param (`shortLink` or UUID); drives the React Query cache key. */
  readonly boardKey: string;
  /**
   * First paint from the server (`getBoard` in `page.tsx`). Passed into
   * `useBoardDetail` as `initialData` so TanStack starts warm; refetches still
   * go through the hook + `/api/boards/...`.
   */
  readonly initialBoard: BoardDetail;
};

/**
 * **TanStack entry point for this route:** owns `useBoardDetail(boardKey, initialBoard)`.
 * Children stay presentational — they only receive `board` props (from `data` here).
 */
export function BoardPageContent({
  boardKey,
  initialBoard,
}: BoardPageContentProperties) {
  const { data, isPending, error } = useBoardDetail(boardKey, initialBoard);

  // Keep showing the board when we already have payload (e.g. from SSR
  // `initialData`). TanStack Query sets `isError` for refetch failures too
  // (`isRefetchError`) while `data` is still defined — treating that as fatal
  // hid the board after PATCH invalidation or focus refetch.
  if (data !== undefined) {
    return <TrelloBoard board={data} boardKey={boardKey} />;
  }

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center text-white/80">
        Loading board…
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-1 items-center justify-center text-red-300">
      {error instanceof Error ? error.message : "Failed to load board"}
    </div>
  );
}

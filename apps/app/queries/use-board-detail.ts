"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchBoardDetailClient } from "@/lib/api/boards/fetch-board-detail-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

/**
 * Subscribes to TanStack Query’s cache for one board.
 *
 * - **Server** (`b/[id]/page.tsx`): still loads the board for fast HTML + `notFound()`.
 * - **This hook**: seeds the cache with that payload (`initialData`), then can refetch
 *   (background updates, mutations, `invalidateQueries`, etc.).
 *
 * Call only from client components (e.g. `BoardPageContent`).
 */
export function useBoardDetail(boardKey: string, initialBoard: BoardDetail) {
  return useQuery({
    queryKey: boardDetailQueryKey(boardKey),
    queryFn: () => fetchBoardDetailClient(boardKey),
    initialData: initialBoard,
    staleTime: 60 * 1000,
  });
}

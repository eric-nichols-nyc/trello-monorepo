"use client";

import { useAuth } from "@repo/clerk/client";
import { useQuery } from "@tanstack/react-query";

import { fetchBoardDetailClient } from "@/lib/api/boards/fetch-board-detail-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

/**
 * Client board detail cache: seeds from SSR `initialBoard`, refetches via Nest
 * with Clerk session token.
 */
export function useBoardDetail(boardKey: string, initialBoard: BoardDetail) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: boardDetailQueryKey(boardKey),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return fetchBoardDetailClient(boardKey, token);
    },
    initialData: initialBoard,
    staleTime: 60 * 1000,
  });
}

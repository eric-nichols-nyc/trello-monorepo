"use client";

import { useQuery } from "@tanstack/react-query";

import {
  boardDetailSampleQueryKey,
  fetchBoardDetailSample,
} from "./board-detail";

export function useBoardDetailSample() {
  return useQuery({
    queryKey: boardDetailSampleQueryKey,
    queryFn: fetchBoardDetailSample,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

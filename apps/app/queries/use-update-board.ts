"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type UpdateBoardPatchBody,
  patchBoardClient,
} from "@/lib/api/boards/patch-board-client";

import { boardDetailQueryKey } from "./board-detail-query";

export type UpdateBoardMutationVariables = {
  /** Board primary key for Nest `PATCH /boards/:id`. */
  boardId: string;
  /** Route/cache key from the URL (`shortLink` or id) — must match `useBoardDetail`. */
  boardKey: string;
  updates: UpdateBoardPatchBody;
};

/**
 * PATCH board fields on the API and refresh the board-detail query for `boardKey`.
 * (Nest returns a partial board payload; invalidating avoids a stale nested shape.)
 */
export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, updates }: UpdateBoardMutationVariables) =>
      patchBoardClient(boardId, updates),
    onSuccess: (_data, { boardKey }) => {
      queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardKey),
      });
    },
  });
}

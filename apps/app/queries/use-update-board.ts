"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  patchBoardClient,
  type UpdateBoardPatchBody,
} from "@/lib/api/boards/patch-board-client";
import {
  type BoardDetail,
  mergeBoardPatchResponseIntoDetail,
} from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

export type UpdateBoardMutationVariables = {
  /** Board primary key for Nest `PATCH /boards/:id`. */
  boardId: string;
  /** Route/cache key from the URL (`shortLink` or id) — must match `useBoardDetail`. */
  boardKey: string;
  updates: UpdateBoardPatchBody;
};

type UpdateBoardMutationContext = {
  previous: BoardDetail | undefined;
};

/**
 * PATCH board fields on Nest with optimistic cache merge, rollback on error,
 * then invalidate to reconcile with the server.
 */
export function useUpdateBoard() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      boardId,
      updates,
    }: UpdateBoardMutationVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return patchBoardClient(boardId, updates, token);
    },
    onSuccess: (data, { boardKey }) => {
      const key = boardDetailQueryKey(boardKey);
      queryClient.setQueryData<BoardDetail>(key, (old) =>
        old ? mergeBoardPatchResponseIntoDetail(old, data) : old,
      );
    },
    onMutate: async ({
      boardKey,
      updates,
    }): Promise<UpdateBoardMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<BoardDetail>(key);

      queryClient.setQueryData<BoardDetail>(key, (old) =>
        old ? { ...old, ...updates } : old,
      );

      return { previous };
    },
    onError: (_error, { boardKey }, context) => {
      const key = boardDetailQueryKey(boardKey);
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: (_data, _error, { boardKey }) => {
      queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardKey),
      });
    },
  });
}

"use client";

/**
 * TanStack Query mutation for `PATCH /lists/:id`. Keeps `useBoardDetail` cache in
 * sync via optimistic updates on `boardDetailQueryKey(boardKey)` and refetch on settle.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  patchListClient,
  type UpdateListPatchBody,
} from "@/lib/api/lists/patch-list-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

/** Applies patch to one list row; re-sorts `lists` by `pos` when `pos` is set. */
function mergeListPatchIntoBoard(
  old: BoardDetail,
  listId: string,
  updates: UpdateListPatchBody
): BoardDetail {
  const nextLists = old.lists.map((l) => {
    if (l.id !== listId) {
      return l;
    }
    return {
      ...l,
      ...(updates.pos !== undefined ? { pos: updates.pos } : {}),
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.closed !== undefined ? { closed: updates.closed } : {}),
    };
  });
  if (updates.pos !== undefined) {
    nextLists.sort((a, b) => a.pos - b.pos);
  }
  return { ...old, lists: nextLists };
}

export type UpdateListMutationVariables = {
  /** Target list UUID. */
  listId: string;
  /** Must match the key passed to `useBoardDetail` (e.g. board short link). */
  boardKey: string;
  updates: UpdateListPatchBody;
};

type UpdateListMutationContext = {
  previous: BoardDetail | undefined;
};

/**
 * PATCH list fields with optimistic `BoardDetail` merge, rollback on error,
 * and `invalidateQueries` on settle so list rows match the server response.
 */
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, updates }: UpdateListMutationVariables) =>
      patchListClient(listId, updates),
    onMutate: async ({
      boardKey,
      listId,
      updates,
    }): Promise<UpdateListMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<BoardDetail>(key);

      const hasListPatch =
        updates.pos !== undefined ||
        updates.name !== undefined ||
        updates.closed !== undefined;

      if (hasListPatch) {
        queryClient.setQueryData<BoardDetail>(key, (old) =>
          old ? mergeListPatchIntoBoard(old, listId, updates) : old
        );
      }

      return { previous };
    },
    onSuccess: (data, { listId, updates }) => {
      console.log("[useUpdateList] success", { listId, updates, data });
    },
    onError: (error, { boardKey, listId, updates }, context) => {
      console.error("[useUpdateList] error", { listId, updates, error });
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

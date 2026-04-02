"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  patchListClient,
  type UpdateListPatchBody,
} from "@/lib/api/lists/patch-list-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

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
  listId: string;
  boardKey: string;
  updates: UpdateListPatchBody;
};

type UpdateListMutationContext = { previous: BoardDetail | undefined };

export function useUpdateList() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ listId, updates }: UpdateListMutationVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return patchListClient(listId, updates, token);
    },
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

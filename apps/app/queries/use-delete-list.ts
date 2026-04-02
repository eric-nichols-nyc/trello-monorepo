"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteListClient } from "@/lib/api/lists/delete-list-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

function removeListFromBoard(old: BoardDetail, listId: string): BoardDetail {
  return {
    ...old,
    lists: old.lists.filter((l) => l.id !== listId),
  };
}

export type DeleteListMutationVariables = {
  listId: string;
  boardKey: string;
};

type DeleteListMutationContext = { previous: BoardDetail | undefined };

export function useDeleteList() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ listId }: DeleteListMutationVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return deleteListClient(listId, token);
    },
    onMutate: async ({
      boardKey,
      listId,
    }): Promise<DeleteListMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardDetail>(key);
      queryClient.setQueryData<BoardDetail>(key, (old) =>
        old ? removeListFromBoard(old, listId) : old
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

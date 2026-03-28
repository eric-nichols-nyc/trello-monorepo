"use client";

import type { CreateListInput } from "@repo/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postListClient } from "@/lib/api/lists/post-list-client";
import type { BoardDetail, BoardList } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

export type CreateListMutationVariables = {
  boardId: string;
  boardKey: string;
  input: CreateListInput;
};

type CreateListMutationContext = {
  previous: BoardDetail | undefined;
};

function nextListPos(lists: BoardList[]): number {
  if (lists.length === 0) {
    return 1000;
  }
  return Math.max(...lists.map((l) => l.pos)) + 1000;
}

function buildOptimisticList(
  boardId: string,
  input: CreateListInput,
  tempId: string,
  pos: number
): BoardList {
  const now = new Date().toISOString();
  return {
    id: tempId,
    boardId,
    pos,
    name: input.name,
    closed: input.closed ?? false,
    createdAt: now,
    updatedAt: now,
    cards: [],
  };
}

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, input }: CreateListMutationVariables) =>
      postListClient(boardId, input),
    onMutate: async ({
      boardKey,
      boardId,
      input,
    }): Promise<CreateListMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<BoardDetail>(key);
      const tempId = `temp-${crypto.randomUUID()}`;

      queryClient.setQueryData<BoardDetail>(key, (old) => {
        if (!old) {
          return old;
        }
        const pos = input.pos ?? nextListPos(old.lists);
        const optimistic = buildOptimisticList(boardId, input, tempId, pos);
        const nextLists = [...old.lists, optimistic].sort(
          (a, b) => a.pos - b.pos
        );
        return { ...old, lists: nextLists };
      });

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

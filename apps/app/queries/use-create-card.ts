"use client";

import type { CreateCardInput } from "@repo/schemas";
import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postCardClient } from "@/lib/api/cards/post-card-client";
import type { BoardCard, BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

export type CreateCardMutationVariables = {
  listId: string;
  boardKey: string;
  input: CreateCardInput;
};

type CreateCardMutationContext = { previous: BoardDetail | undefined };

function dueDateToIso(value: CreateCardInput["dueDate"]): string | null {
  if (value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

/** Optimistic row before the server responds; `onSettled` invalidates for real data. */
export function buildOptimisticCard(
  listId: string,
  boardId: string,
  input: CreateCardInput,
  tempId: string
): BoardCard {
  const now = new Date().toISOString();
  const cover =
    input.coverImage !== undefined
      ? { coverImage: input.coverImage, coverColor: null }
      : input.coverColor !== undefined
        ? { coverColor: input.coverColor, coverImage: null }
        : { coverColor: null, coverImage: null };
  return {
    id: tempId,
    name: input.name,
    description: input.description ?? null,
    pos: input.pos ?? Date.now(),
    closed: input.closed ?? false,
    completed: input.completed ?? false,
    attachmentCount: 0,
    dueDate: dueDateToIso(input.dueDate),
    shortLink: "",
    coverColor: cover.coverColor,
    coverImage: cover.coverImage,
    listId,
    boardId,
    assigneeId: input.assigneeId ?? null,
    createdAt: now,
    updatedAt: now,
    comments: [],
    checklists: [],
  };
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ listId, input }: CreateCardMutationVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return postCardClient(listId, input, token);
    },
    onMutate: async ({
      boardKey,
      listId,
      input,
    }): Promise<CreateCardMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardDetail>(key);
      const tempId = `temp-${crypto.randomUUID()}`;

      queryClient.setQueryData<BoardDetail>(key, (old) => {
        if (!old) {
          return old;
        }
        const listIndex = old.lists.findIndex((l) => l.id === listId);
        if (listIndex === -1) {
          return old;
        }
        const list = old.lists[listIndex];
        const optimistic = buildOptimisticCard(
          listId,
          list.boardId,
          input,
          tempId
        );
        const nextLists = [...old.lists];
        nextLists[listIndex] = {
          ...list,
          cards: [...list.cards, optimistic].sort((a, b) => a.pos - b.pos),
        };
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

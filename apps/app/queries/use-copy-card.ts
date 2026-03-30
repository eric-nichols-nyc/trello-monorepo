"use client";

import type { CreateCardInput } from "@repo/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postCardClient } from "@/lib/api/cards/post-card-client";
import type { BoardCard, BoardDetail, BoardList } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";
import { buildOptimisticCard } from "./use-create-card";

export type CopyCardMutationVariables = {
  boardKey: string;
  cardId: string;
};

type CopyCardMutationContext = {
  previous: BoardDetail | undefined;
};

function findCardInBoard(
  board: BoardDetail,
  cardId: string
): { list: BoardList; card: BoardCard } | null {
  for (const list of board.lists) {
    const card = list.cards.find((c) => c.id === cardId);
    if (card) {
      return { list, card };
    }
  }
  return null;
}

/** POST body for a duplicate in the same list (derived from cached source card). */
function buildCopyInput(source: BoardCard): CreateCardInput {
  const baseName = source.name.trim() || "Card";
  const input: CreateCardInput = {
    name: `${baseName} (copy)`,
    pos: source.pos + 1000,
    closed: source.closed,
  };
  if (source.description) {
    input.description = source.description;
  }
  if (source.dueDate) {
    input.dueDate = new Date(source.dueDate);
  }
  if (source.assigneeId) {
    input.assigneeId = source.assigneeId;
  }
  return input;
}

/**
 * Duplicates a card in its current list via `postCardClient` (same endpoint as
 * create). Uses cached board detail to build the payload and for optimistic UI.
 */
export function useCopyCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardKey,
      cardId,
    }: CopyCardMutationVariables): Promise<unknown> => {
      const board = queryClient.getQueryData<BoardDetail>(
        boardDetailQueryKey(boardKey)
      );
      if (!board) {
        throw new Error("Board not loaded");
      }
      const found = findCardInBoard(board, cardId);
      if (!found) {
        throw new Error("Card not found");
      }
      const input = buildCopyInput(found.card);
      return postCardClient(found.list.id, input);
    },
    onMutate: async ({
      boardKey,
      cardId,
    }): Promise<CopyCardMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<BoardDetail>(key);
      if (!previous) {
        return { previous };
      }

      const found = findCardInBoard(previous, cardId);
      if (!found) {
        return { previous };
      }

      const input = buildCopyInput(found.card);
      const tempId = `temp-${crypto.randomUUID()}`;

      queryClient.setQueryData<BoardDetail>(key, (old) => {
        if (!old) {
          return old;
        }
        const listIndex = old.lists.findIndex((l) => l.id === found.list.id);
        if (listIndex === -1) {
          return old;
        }
        const list = old.lists[listIndex];
        const optimistic = buildOptimisticCard(
          found.list.id,
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
    onError: (error, { boardKey }, context) => {
      console.error("[useCopyCard] error", { boardKey, error });
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

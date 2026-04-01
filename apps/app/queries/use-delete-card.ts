"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCardClient } from "@/lib/api/cards/delete-card-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

function removeCardFromBoard(old: BoardDetail, cardId: string): BoardDetail {
  return {
    ...old,
    lists: old.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((c) => c.id !== cardId),
    })),
  };
}

export type DeleteCardMutationVariables = {
  cardId: string;
  boardKey: string;
};

type DeleteCardMutationContext = {
  previous: BoardDetail | undefined;
};

export function useDeleteCard() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ cardId }: DeleteCardMutationVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return deleteCardClient(cardId, token);
    },
    onMutate: async ({
      boardKey,
      cardId,
    }): Promise<DeleteCardMutationContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<BoardDetail>(key);

      queryClient.setQueryData<BoardDetail>(key, (old) =>
        old ? removeCardFromBoard(old, cardId) : old
      );

      return { previous };
    },
    onError: (error, { boardKey }, context) => {
      console.error("[useDeleteCard] error", { boardKey, error });
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

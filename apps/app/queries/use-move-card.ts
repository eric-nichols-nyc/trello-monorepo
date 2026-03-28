"use client";

import type { MoveCardPatchInput } from "@repo/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchCardClient } from "@/lib/api/cards/patch-card-client";
import { reorderListCardsClient } from "@/lib/api/cards/reorder-list-cards-client";
import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

export type MoveCardMutationVariables =
  | {
      boardKey: string;
      nextBoardDetail: BoardDetail;
      mode: "patch";
      cardId: string;
      body: MoveCardPatchInput;
    }
  | {
      boardKey: string;
      nextBoardDetail: BoardDetail;
      mode: "reorder";
      listId: string;
      cardIds: string[];
    };

type MoveCardMutationContext = {
  previous: BoardDetail | undefined;
};

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: MoveCardMutationVariables) => {
      if (variables.mode === "patch") {
        return patchCardClient(variables.cardId, variables.body);
      }
      return reorderListCardsClient(variables.listId, {
        cardIds: variables.cardIds,
      });
    },
    onMutate: async (
      variables: MoveCardMutationVariables
    ): Promise<MoveCardMutationContext> => {
      const key = boardDetailQueryKey(variables.boardKey);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BoardDetail>(key);
      queryClient.setQueryData(key, variables.nextBoardDetail);
      return { previous };
    },
    onError: (_error, variables, context) => {
      const key = boardDetailQueryKey(variables.boardKey);
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(variables.boardKey),
      });
    },
  });
}

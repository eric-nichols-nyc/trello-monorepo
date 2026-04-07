"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { postCardCommentClient } from "@/lib/api/comments/post-card-comment-client";
import { toast } from "@/lib/toast";

import { boardDetailQueryKey } from "./board-detail-query";

export type CreateCardCommentVariables = {
  cardId: string;
  boardRouteKey: string;
  text: string;
};

export function useCreateCardComment() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (variables: CreateCardCommentVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return postCardCommentClient(
        variables.cardId,
        { text: variables.text },
        token,
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(variables.boardRouteKey),
      });
      router.refresh();
    },
    onError: () => {
      toast.error("Could not post comment");
    },
  });
}

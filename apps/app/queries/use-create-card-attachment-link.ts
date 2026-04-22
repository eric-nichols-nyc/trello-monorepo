"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  type CardAttachmentResult,
  postCardAttachmentLinkClient,
} from "@/lib/api/cards/post-card-attachment-link-client";
import { toast } from "@/lib/toast";

import { boardDetailQueryKey } from "./board-detail-query";

export type UseCreateCardAttachmentLinkOptions = {
  readonly boardRouteKey: string;
  readonly cardId: string;
  readonly onSuccess?: () => void;
};

export function useCreateCardAttachmentLink({
  boardRouteKey,
  cardId,
  onSuccess,
}: UseCreateCardAttachmentLinkOptions) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (variables: {
      url: string;
      name?: string;
    }): Promise<CardAttachmentResult> => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return postCardAttachmentLinkClient(cardId, variables, token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardRouteKey),
      });
      router.refresh();
      toast.success("Link attached");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Could not add link");
    },
  });
}

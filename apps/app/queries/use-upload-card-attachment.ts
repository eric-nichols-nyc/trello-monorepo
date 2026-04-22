"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  type CardAttachmentResult,
  postCardAttachmentClient,
} from "@/lib/api/cards/post-card-attachment-client";
import { toast } from "@/lib/toast";

import { boardDetailQueryKey } from "./board-detail-query";

export type UseUploadCardAttachmentOptions = {
  readonly boardRouteKey: string;
  readonly cardId: string;
  /** After upload succeeds and cache invalidation is started */
  readonly onSuccess?: () => void;
};

/**
 * Uploads a file to the card’s attachment endpoint (Nest → Cloudinary → DB),
 * then refreshes board detail cache and the Next.js router so list badges stay in sync.
 */
export function useUploadCardAttachment({
  boardRouteKey,
  cardId,
  onSuccess,
}: UseUploadCardAttachmentOptions) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (variables: {
      file: File;
      name?: string;
    }): Promise<CardAttachmentResult> => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return postCardAttachmentClient(cardId, variables.file, token, {
        name: variables.name,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardRouteKey),
      });
      router.refresh();
      toast.success("Attachment uploaded");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Could not upload attachment");
    },
  });
}

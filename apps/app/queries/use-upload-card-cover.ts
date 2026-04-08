"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import {
  type UploadImageResult,
  postUploadImageClient,
} from "@/lib/api/uploads/post-upload-image-client";
import { toast } from "@/lib/toast";

import { boardDetailQueryKey } from "./board-detail-query";

export type UseUploadCardCoverOptions = {
  readonly boardKey: string;
  readonly cardId: string;
  /** After upload + PATCH and board invalidation are started */
  readonly onSuccess?: () => void;
};

/**
 * Upload an image to Nest/Cloudinary, PATCH the card `coverImage`, invalidate board detail.
 */
export function useUploadCardCover({
  boardKey,
  cardId,
  onSuccess,
}: UseUploadCardCoverOptions) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (file: File): Promise<UploadImageResult> => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      const uploaded = await postUploadImageClient(file, token);
      await updateCardClient(
        cardId,
        { coverImage: uploaded.secureUrl },
        token,
      );
      return uploaded;
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: boardDetailQueryKey(boardKey) })
        .catch(() => {
          /* best-effort refresh */
        });
      onSuccess?.();
    },
    onError: () => {
      toast.error("Could not upload cover");
    },
  });
}

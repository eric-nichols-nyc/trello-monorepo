"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ColorPalette } from "../ColorPalette";
import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

export type ColorCoverProps = {
  readonly boardKey: string;
  readonly cardId: string;
  readonly coverColor?: string | null;
  readonly coverImage?: string | null;
  readonly onApplied?: () => void;
};

/**
 * Solid color swatches (2×5 rectangular tiles); PATCHes `coverColor` and clears `coverImage`.
 */
export function ColorCover({
  boardKey,
  cardId,
  coverColor,
  coverImage,
  onApplied,
}: ColorCoverProps) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const hasImage =
    coverImage != null && String(coverImage).trim().length > 0;

  const mutation = useMutation({
    mutationFn: async (hex: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      await updateCardClient(
        cardId,
        { coverColor: hex, coverImage: null },
        token,
      );
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: boardDetailQueryKey(boardKey) })
        .catch(() => {
          /* best-effort */
        });
      onApplied?.();
    },
    onError: () => {
      toast.error("Could not set cover color");
    },
  });

  const selectedHex =
    hasImage === false &&
    coverColor != null &&
    String(coverColor).trim().length > 0
      ? String(coverColor)
      : null;

  return (
    <div className="space-y-2">
      <p className="font-semibold text-xs text-zinc-400">Color</p>
      <ColorPalette
        disabled={mutation.isPending}
        onSelect={(hex) => mutation.mutate(hex)}
        selectedHex={selectedHex}
      />
    </div>
  );
}

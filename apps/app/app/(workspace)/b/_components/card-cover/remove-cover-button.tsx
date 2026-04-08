"use client";

import { useAuth } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

export type RemoveCoverButtonProps = {
  readonly boardKey: string;
  readonly cardId: string;
  readonly onApplied?: () => void;
};

/** Clears `coverImage` and `coverColor` on the card via PATCH. */
export function RemoveCoverButton({
  boardKey,
  cardId,
  onApplied,
}: RemoveCoverButtonProps) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      await updateCardClient(
        cardId,
        { coverImage: null, coverColor: null },
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
      toast.error("Could not remove cover");
    },
  });

  return (
    <Button
      className="w-full"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      type="button"
      variant="destructive"
    >
      {mutation.isPending ? "Removing…" : "Remove cover"}
    </Button>
  );
}

"use client";

import { useAuth } from "@repo/clerk/client";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { DialogTitle } from "@repo/design-system/components/ui/dialog";
import { cn } from "@repo/design-system/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

export type CardBackTitleProps = {
  title: string;
  mode: "modal" | "page";
  cardId: string;
  boardRouteKey: string;
  completed: boolean;
  onCompletedChange: (completed: boolean) => void;
};

const titleClass =
  "font-semibold text-2xl leading-none tracking-tight";

const checkboxClassName =
  "size-5 shrink-0 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600 [&_[data-slot=checkbox-indicator]_svg]:size-[18px]";

export function CardBackTitle({
  title,
  mode,
  cardId,
  boardRouteKey,
  completed,
  onCompletedChange,
}: CardBackTitleProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const saveMutation = useMutation({
    mutationFn: async (nextCompleted: boolean) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return updateCardClient(cardId, { completed: nextCompleted }, token);
    },
    onSuccess: (data, nextCompleted) => {
      const record = data as Record<string, unknown>;
      if (typeof record.completed === "boolean") {
        onCompletedChange(record.completed);
      } else {
        onCompletedChange(nextCompleted);
      }
      void queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardRouteKey),
      });
      router.refresh();
    },
  });

  const handleCheckedChange = (value: boolean | "indeterminate") => {
    if (value === "indeterminate") {
      return;
    }
    const next = value === true;
    const previousCompleted = completed;
    onCompletedChange(next);
    saveMutation.mutate(next, {
      onError: () => {
        onCompletedChange(previousCompleted);
        toast.error("Could not update card");
      },
    });
  };

  const titleVisualClass = cn(
    titleClass,
    completed && "text-zinc-400 decoration-zinc-500",
  );

  return (
    <div className="mb-6 flex items-start gap-3">
      <span
        className="mt-1 shrink-0"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Checkbox
          aria-label={
            completed ? "Mark card incomplete" : "Mark card complete"
          }
          checked={completed}
          className={checkboxClassName}
          disabled={saveMutation.isPending}
          onCheckedChange={handleCheckedChange}
        />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        {mode === "modal" ? (
          <DialogTitle className={titleVisualClass}>{title}</DialogTitle>
        ) : (
          <h1 className={titleVisualClass}>{title}</h1>
        )}
      </div>
    </div>
  );
}

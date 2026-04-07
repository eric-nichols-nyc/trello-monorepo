"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { useAuth } from "@repo/clerk/client";
import { cn } from "@repo/design-system/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MouseEvent, memo, useCallback } from "react";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

import { CardBadges } from "../CardBadges/card-badges";
import { CardActions } from "./card-actions";
import { ListCardTitle } from "./list-card-title";

/** Outer shell shared by {@link ListCardFront} and {@link ListCardDragPreview}. */
export const LIST_CARD_SURFACE_CLASSNAME =
  "relative flex min-h-[45px] w-full min-w-0 flex-1 items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2";

export type ListCardDragPreviewProps = {
  title: string;
  showEditIcon?: boolean;
  /** Required when `showEditIcon` is true so {@link CardActions} can target this card. */
  cardId?: string;
  boardKey?: string;
  onOpenCard?: () => void;
  onArchive?: () => void;
};

/**
 * Non-interactive card shell for drag overlays — matches {@link ListCardFront}
 * visuals (surface + title) without sortable wiring, checkbox, or mutations.
 */
export function ListCardDragPreview({
  title,
  showEditIcon = false,
  boardKey,
  cardId,
  onOpenCard,
  onArchive,
}: ListCardDragPreviewProps) {
  const showActions =
    showEditIcon === true &&
    cardId !== undefined &&
    boardKey !== undefined &&
    boardKey !== "";

  return (
    <div className={cn(LIST_CARD_SURFACE_CLASSNAME, "cursor-grabbing")}>
      {showActions ? (
        <CardActions
          boardKey={boardKey}
          cardId={cardId}
          cardTitle={title}
          onArchive={onArchive}
          onOpenCard={onOpenCard}
        />
      ) : null}
      <ListCardTitle
        className="translate-x-0"
        contentGutterForEdit={showActions}
        title={title}
      />
    </div>
  );
}

export type ListCardFrontProps = {
  boardKey: string;
  cardId: string;
  columnId: string;
  index: number;
  title: string;
  completed: boolean;
  onCardCompletedChange: (completed: boolean) => void;
  onOpenCard?: () => void;
  onArchive?: () => void;
};

/**
 * Sortable list card for the nested `@dnd-kit/react` board (title, badges,
 * actions, persisted completion).
 */
export const ListCardFront = memo(function ListCardFrontFrame({
  boardKey,
  cardId,
  columnId,
  index,
  title,
  completed,
  onCardCompletedChange,
  onOpenCard,
  onArchive,
}: ListCardFrontProps) {
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
    onSuccess: (data) => {
      const record = data as Record<string, unknown>;
      if (typeof record.completed === "boolean") {
        onCardCompletedChange(record.completed);
      }
      void queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardKey),
      });
    },
  });

  const handleCheckedChange = (value: boolean | "indeterminate") => {
    if (value === "indeterminate") {
      return;
    }
    const next = value === true;
    const previousCompleted = completed;
    onCardCompletedChange(next);
    saveMutation.mutate(next, {
      onError: () => {
        onCardCompletedChange(previousCompleted);
        toast.error("Could not update card");
      },
    });
  };

  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: cardId,
    index,
    group: columnId,
    type: "item",
    accept: "item",
    feedback: "clone",
  });

  const setLiRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (completed) {
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && event.currentTarget.contains(active)) {
      active.blur();
    }
  };

  const handleSurfaceClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!onOpenCard) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (
        target.closest(
          "button,a,[role='checkbox'],[data-slot='checkbox'],input,textarea,select"
        )
      ) {
        return;
      }
      onOpenCard();
    },
    [onOpenCard]
  );

  return (
    <li
      data-testid="list-card"
      className={cn(
        "group relative flex list-none",
        isDragging ? "opacity-0" : ""
      )}
      ref={setLiRef}
    >
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: card chrome */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: same */}
      <div
        className={cn(
          LIST_CARD_SURFACE_CLASSNAME,
          "cursor-grab touch-none active:cursor-grabbing"
        )}
        onClick={handleSurfaceClick}
        onMouseLeave={handleMouseLeave}
        ref={handleRef}
      >
        <CardActions
          boardKey={boardKey}
          cardId={cardId}
          cardTitle={title}
          onArchive={onArchive}
          onOpenCard={onOpenCard}
        />
        <div className="relative z-2 flex min-w-0 flex-1 flex-col">
          <ListCardTitle
            completed={completed}
            completion={{
              checked: completed,
              disabled: saveMutation.isPending,
              onCheckedChange: handleCheckedChange,
            }}
            title={title}
          />
          {/* Same inset as `size-5` + `gap-2` title row so metadata lines up under the text */}
          <div className="pl-2">
            <CardBadges />
          </div>
        </div>
      </div>
    </li>
  );
});

"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { useAuth } from "@repo/clerk/client";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MouseEvent, memo, useCallback, useState } from "react";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

import { CardActions } from "./card-actions";
import { ListCardTitle } from "./list-card-title";

/** Outer shell shared by {@link ListCard} and {@link ListCardChrome}. */
export const LIST_CARD_SURFACE_CLASSNAME =
  "relative flex min-h-[45px] w-full min-w-0 flex-1 items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2";

type ListCardTitleAreaProps = {
  title: string;
  className?: string;
  /** Right padding so title text clears {@link CardActions} trigger. @default true */
  contentGutterForEdit?: boolean;
  completed?: boolean;
};

/** Title row inside the card surface (typography + layout). */
export function ListCardTitleArea({
  title,
  className,
  contentGutterForEdit = true,
  completed = false,
}: ListCardTitleAreaProps) {
  return (
    <div
      className={cn(
        "relative z-2 min-w-0 flex-1 transition-transform duration-200 ease-out",
        contentGutterForEdit === true ? "pr-7" : null,
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <ListCardTitle
          className="min-w-0 flex-1"
          completed={completed}
          title={title}
        />
      </div>
    </div>
  );
}

type ListCardChromeProps = {
  title: string;
  showEditIcon?: boolean;
  /** Required when `showEditIcon` is true so {@link CardActions} can target this card. */
  cardId?: string;
  boardKey?: string;
  onOpenCard?: () => void;
  onArchive?: () => void;
};

/**
 * Static card surface for {@link DragOverlay} — composes the same shell and
 * title row as {@link ListCard} without sortable or checkbox.
 */
export function ListCardChrome({
  title,
  showEditIcon = false,
  boardKey,
  cardId,
  onOpenCard,
  onArchive,
}: ListCardChromeProps) {
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
      <ListCardTitleArea
        className="translate-x-0"
        contentGutterForEdit={showActions}
        title={title}
      />
    </div>
  );
}

export type BoardCardItemProps = {
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
 * Sortable card row for the nested `@dnd-kit/react` board: same chrome as
 * {@link ListCard}, wired to column `group` + drag handle ref.
 */
export const BoardCardItem = memo(function BoardCardItemFrame({
  boardKey,
  cardId,
  columnId,
  index,
  title,
  completed,
  onCardCompletedChange,
  onOpenCard,
  onArchive,
}: BoardCardItemProps) {
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
        <span
          className={cn(
            "-translate-y-1/2 absolute top-1/2 left-3 z-1 transition-opacity duration-150",
            completed
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            aria-label={`Mark card complete: ${title}`}
            checked={completed}
            className="size-5 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600 [&_[data-slot=checkbox-indicator]_svg]:size-[18px]"
            disabled={saveMutation.isPending}
            onCheckedChange={handleCheckedChange}
          />
        </span>
        <CardActions
          boardKey={boardKey}
          cardId={cardId}
          cardTitle={title}
          onArchive={onArchive}
          onOpenCard={onOpenCard}
        />
        <ListCardTitleArea
          className={
            completed
              ? "translate-x-7"
              : "translate-x-0 group-focus-within:translate-x-7 group-hover:translate-x-7"
          }
          completed={completed}
          title={title}
        />
      </div>
    </li>
  );
});

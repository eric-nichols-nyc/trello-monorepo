"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { useAuth } from "@repo/clerk/client";
import { cn } from "@repo/design-system/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MouseEvent, memo, useCallback } from "react";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

import { type CardBadgesProps, CardBadges } from "../CardBadges/card-badges";
import { CardFrontCover } from "./card-front-cover";
import { CardOverflowMenu } from "./card-overflow-menu";
import { ListCardTitle } from "./list-card-title";

/** Outer shell shared by {@link ListCardFront} and {@link ListCardDragPreview}. */
export const LIST_CARD_SURFACE_CLASSNAME =
  "relative flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-[rgb(36,37,40)]";

/** Padded row for title + actions (below optional {@link CardFrontCover}). */
export const LIST_CARD_CONTENT_ROW_CLASSNAME =
  "relative flex min-h-[45px] flex-1 items-center px-3 py-2";

export type ListCardDragPreviewProps = {
  title: string;
  showEditIcon?: boolean;
  /** Required when `showEditIcon` is true so {@link CardOverflowMenu} can target this card. */
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
        <CardOverflowMenu
          boardKey={boardKey}
          cardId={cardId}
          cardTitle={title}
          onArchive={onArchive}
          onOpenCard={onOpenCard}
        />
      ) : null}
      <div className={LIST_CARD_CONTENT_ROW_CLASSNAME}>
        <ListCardTitle
          className="translate-x-0"
          contentGutterForEdit={showActions}
          title={title}
        />
      </div>
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
  coverColor?: string | null;
  coverImage?: string | null;
} & Pick<
  CardBadgesProps,
  | "attachmentCount"
  | "checklistCompleted"
  | "checklistDue"
  | "checklistTotal"
  | "commentCount"
  | "description"
  | "dueDate"
  | "startDate"
>;

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
  attachmentCount,
  checklistCompleted,
  checklistDue,
  checklistTotal,
  commentCount,
  description,
  dueDate,
  startDate,
  onCardCompletedChange,
  onOpenCard,
  onArchive,
  coverColor,
  coverImage,
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
      queryClient
        .invalidateQueries({
          queryKey: boardDetailQueryKey(boardKey),
        })
        .catch(() => {
          /* best-effort refresh */
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
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: pointer-driven list card; inner controls are keyboard-accessible */}
      <div
        className={cn(
          LIST_CARD_SURFACE_CLASSNAME,
          "cursor-grab touch-none active:cursor-grabbing"
        )}
        onClick={handleSurfaceClick}
        onMouseLeave={handleMouseLeave}
        ref={handleRef}
      >
        <CardFrontCover coverColor={coverColor} coverImage={coverImage} />
        <CardOverflowMenu
          boardKey={boardKey}
          cardId={cardId}
          cardTitle={title}
          hasCover={
            (coverImage != null && String(coverImage).trim() !== "") ||
            (coverColor != null && String(coverColor).trim() !== "")
          }
          onArchive={onArchive}
          onOpenCard={onOpenCard}
        />
        <div className={LIST_CARD_CONTENT_ROW_CLASSNAME}>
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
            <div>
              <CardBadges
                attachmentCount={attachmentCount}
                checklistCompleted={checklistCompleted}
                checklistDue={checklistDue}
                checklistTotal={checklistTotal}
                commentCount={commentCount}
                description={description}
                dueComplete={completed}
                dueDate={dueDate}
                startDate={startDate}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
});

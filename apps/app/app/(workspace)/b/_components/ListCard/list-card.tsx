"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { useAuth } from "@repo/clerk/client";
import { cn } from "@repo/design-system/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type MouseEvent, memo, useCallback, useEffect, useState } from "react";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

import { type CardBadgesProps, CardBadges } from "../CardBadges/card-badges";
import { CardFrontCover } from "./card-front-cover";
import { CardEditorPopover } from "../CardEditorPopover/card-editor-popover";
import { ListCardTitle } from "./list-card-title";

// -----------------------------------------------------------------------------
// Shared layout tokens — keep ListCard and ListCardDragPreview visually aligned.
// -----------------------------------------------------------------------------

/** Outer shell shared by {@link ListCard} and {@link ListCardDragPreview}. */
export const LIST_CARD_SURFACE_CLASSNAME =
  "relative flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-[rgb(36,37,40)]";

/** Padded row for title + actions (below optional {@link CardFrontCover}). */
export const LIST_CARD_CONTENT_ROW_CLASSNAME =
  "relative flex min-h-[45px] flex-1 items-center px-3 py-2";

export type ListCardDragPreviewProps = {
  title: string;
  coverColor?: string | null;
  coverImage?: string | null;
  showEditIcon?: boolean;
  /** Required when `showEditIcon` is true so {@link CardEditorPopover} can target this card. */
  cardId?: string;
  boardKey?: string;
  onOpenCard?: () => void;
  onArchive?: () => void;
};

/**
 * Non-interactive card shell used inside {@link BoardLists}’s `DragOverlay`
 * (and column preview shells in {@link ListColumnDragPreview}).
 *
 * Matches {@link ListCard} chrome for cover + title; badges stay omitted to
 * keep the ghost light.
 */
export function ListCardDragPreview({
  title,
  coverColor,
  coverImage,
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
      <CardFrontCover coverColor={coverColor} coverImage={coverImage} />
      {showActions ? (
        <CardEditorPopover
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

export type ListCardProps = {
  boardKey: string;
  cardId: string;
  columnId: string;
  index: number;
  title: string;
  completed: boolean;
  onCardCompletedChange: (completed: boolean) => void;
  /** Updates optimistic list title after a successful rename PATCH. */
  onCardTitleChange?: (nextTitle: string) => void;
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
 * Production board card: sortable row inside a list column (`group` = list id).
 *
 * DnD: `ref`/`targetRef` on the outer `<li>` participate in layout/collision;
 * `handleRef` on the inner surface is the drag activator (see `@dnd-kit` sortable).
 * While dragging, this node is hidden (`opacity-0`); the cursor ghost is
 * `ListCardDragPreview` in `board-lists.tsx`, not a pixel clone of this tree.
 */
export const ListCard = memo(function ListCardFrame({
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
  onCardTitleChange,
  onOpenCard,
  onArchive,
  coverColor,
  coverImage,
}: ListCardProps) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const [titleEditing, setTitleEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    if (!titleEditing) {
      setDraftTitle(title);
    }
  }, [title, titleEditing]);

  // Checkbox → PATCH card.completed; optimistic UI with rollback on error.
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

  const titleMutation = useMutation({
    mutationFn: async (name: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return updateCardClient(cardId, { name }, token);
    },
    onSuccess: (data, submittedName) => {
      const record = data as Record<string, unknown>;
      const resolved =
        typeof record.name === "string" && record.name.trim().length > 0
          ? String(record.name).trim()
          : submittedName.trim();
      onCardTitleChange?.(resolved);
      setTitleEditing(false);
      queryClient
        .invalidateQueries({
          queryKey: boardDetailQueryKey(boardKey),
        })
        .catch(() => {
          /* best-effort refresh */
        });
    },
    onError: () => {
      toast.error("Could not update card title");
    },
  });

  const toggleTitleEdit = useCallback(() => {
    setTitleEditing((open) => {
      if (open) {
        return false;
      }
      setDraftTitle(title);
      return true;
    });
  }, [title]);

  const cancelTitleEdit = useCallback(() => {
    setDraftTitle(title);
    setTitleEditing(false);
  }, [title]);

  const commitTitle = useCallback(() => {
    const trimmed = draftTitle.trim();
    if (trimmed.length === 0) {
      toast.error("Title is required");
      return;
    }
    if (trimmed === title.trim()) {
      setTitleEditing(false);
      return;
    }
    titleMutation.mutate(trimmed);
  }, [draftTitle, title, titleMutation]);

  // Card is a sortable "item" scoped to this list; reorder vs other items,
  // or move to another list when the column sortable accepts "item".
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: cardId,
    index,
    group: columnId,
    type: "item",
    accept: "item",
    feedback: "clone",
  });

  // Single callback: dnd-kit wants both refs on the measured list row.
  const setLiRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  // Leaving the card while the completion checkbox is focused avoids a stuck
  // focus ring when the row re-renders (e.g. after toggle).
  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (completed || titleEditing) {
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && event.currentTarget.contains(active)) {
      active.blur();
    }
  };

  // Whole-card click opens the card drawer unless the click began on an
  // interactive child (popover trigger, checkbox, links, form controls).
  const handleSurfaceClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!onOpenCard || titleEditing) {
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
    [onOpenCard, titleEditing]
  );

  return (
    <li
      data-testid="list-card"
      className={cn(
        "group relative flex list-none",
        // Hide in-list placeholder while dragging; overlay shows ListCardDragPreview.
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
        <CardEditorPopover
          boardKey={boardKey}
          cardId={cardId}
          cardTitle={title}
          dueDate={dueDate}
          coverColor={coverColor ?? null}
          coverImage={coverImage ?? null}
          hasCover={
            String(coverImage ?? "").trim() !== "" ||
            String(coverColor ?? "").trim() !== ""
          }
          onArchive={onArchive}
          onEditTitle={toggleTitleEdit}
          onOpenCard={onOpenCard}
        />
        <div className={LIST_CARD_CONTENT_ROW_CLASSNAME}>
          <div className="relative z-2 flex min-w-0 flex-1 flex-col">
            <ListCardTitle
              className={titleEditing ? "translate-x-0" : undefined}
              completed={completed}
              completion={{
                checked: completed,
                disabled:
                  saveMutation.isPending === true ||
                  titleMutation.isPending === true,
                onCheckedChange: handleCheckedChange,
              }}
              draftTitle={draftTitle}
              editMode={titleEditing}
              onDraftTitleChange={setDraftTitle}
              onTitleEditCancel={cancelTitleEdit}
              onTitleFormSubmit={commitTitle}
              title={title}
              titleSavePending={titleMutation.isPending}
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

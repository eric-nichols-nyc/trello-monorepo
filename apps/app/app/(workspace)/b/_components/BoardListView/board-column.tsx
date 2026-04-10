"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@repo/design-system/lib/utils";
import { memo, useCallback, useState } from "react";
import { ListCard } from "../ListCard/list-card";
import { ListHeader } from "../ListHeader/list-header";
import { ListFooter } from "../ListWrapper/list-footer";

export type BoardColumnProps = {
  boardKey: string;
  columnIndex: number;
  listId: string;
  title: string;
  cardIds: string[];
  cardTitles: Record<string, string>;
  cardDescriptions: Record<string, string>;
  cardAttachmentCounts: Record<string, number>;
  cardDueDates: Record<string, Date>;
  cardCommentCounts: Record<string, number>;
  cardChecklists: Record<
    string,
    { completed: number; due: string | null; total: number }
  >;
  cardCovers: Record<
    string,
    { coverColor: string | null; coverImage: string | null }
  >;
  cardCompleted: Record<string, boolean>;
  onCardCompletedChange: (cardId: string, completed: boolean) => void;
  /** Optional header debug: suggested vs server `pos` for this column. */
  listPosDebug?: { suggested: number; stored: number };
  onOpenCard?: (cardId: string) => void;
};

export const BoardColumn = memo(function BoardColumnFrame({
  boardKey,
  columnIndex,
  listId,
  title,
  cardIds,
  cardTitles,
  cardDescriptions,
  cardAttachmentCounts,
  cardDueDates,
  cardCommentCounts,
  cardChecklists,
  cardCovers,
  cardCompleted,
  onCardCompletedChange,
  listPosDebug,
  onOpenCard,
}: BoardColumnProps) {
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: listId,
    index: columnIndex,
    type: "column",
    accept: ["column", "item"],
    collisionPriority: CollisionPriority.Low,
  });

  const setColRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <li
      className={cn("w-[270px] shrink-0", isDragging ? "opacity-0" : "")}
      ref={setColRef}
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
        <ListHeader
          boardKey={boardKey}
          dragHandleRef={handleRef}
          listId={listId}
          listPosDebug={listPosDebug}
          onOpenCardQuickAdd={() => setQuickAddOpen(true)}
          title={title}
        />
        <ol className="mx-[4px] my-0 flex min-h-0 list-none flex-col gap-2 p-0">
          {cardIds.map((cardId, index) => (
            <ListCard
              boardKey={boardKey}
              cardId={cardId}
              columnId={listId}
              completed={cardCompleted[cardId] ?? false}
              index={index}
              key={cardId}
              onCardCompletedChange={(next) =>
                onCardCompletedChange(cardId, next)
              }
              onOpenCard={
                onOpenCard === undefined
                  ? undefined
                  : () => {
                      onOpenCard(cardId);
                    }
              }
              attachmentCount={cardAttachmentCounts[cardId] ?? 0}
              coverColor={cardCovers[cardId]?.coverColor ?? null}
              coverImage={cardCovers[cardId]?.coverImage ?? null}
              checklistCompleted={cardChecklists[cardId]?.completed}
              checklistDue={cardChecklists[cardId]?.due}
              checklistTotal={cardChecklists[cardId]?.total}
              commentCount={cardCommentCounts[cardId] ?? 0}
              description={cardDescriptions[cardId]}
              dueDate={cardDueDates[cardId]}
              title={cardTitles[cardId] ?? "Card"}
            />
          ))}
        </ol>
        <ListFooter
          boardKey={boardKey}
          listId={listId}
          onQuickAddOpenChange={setQuickAddOpen}
          quickAddOpen={quickAddOpen}
        />
      </div>
    </li>
  );
});

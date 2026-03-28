"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@repo/design-system/lib/utils";

import { ListCard } from "../ListCard/list-card";

type ListCardsProps = {
  listId: string;
  cardIds: string[];
  cardTitles: Record<string, string>;
  columnDroppableId: string;
};

export const ListCards = ({
  listId: _listId,
  cardIds,
  cardTitles,
  columnDroppableId,
}: ListCardsProps) => {
  const { setNodeRef } = useDroppable({ id: columnDroppableId });

  return (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <ol
        className={cn(
          "mx-[4px] my-0 flex list-none flex-col gap-2 p-0",
          // Keep a modest hit target for @dnd-kit/core droppables when the list is empty.
          cardIds.length === 0 ? "min-h-10" : "min-h-0"
        )}
        ref={setNodeRef}
      >
        {cardIds.map((cardId, index) => (
          <ListCard
            cardId={cardId}
            key={cardId}
            listPosition={index + 1}
            title={cardTitles[cardId] ?? "Card"}
          />
        ))}
      </ol>
    </SortableContext>
  );
};

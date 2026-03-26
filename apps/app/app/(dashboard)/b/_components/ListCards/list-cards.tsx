"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { ListCard } from "../ListCard/list-card";

type ListCardsProps = {
  listId: string;
  cardIds: string[];
  columnDroppableId: string;
};

export const ListCards = ({
  listId,
  cardIds,
  columnDroppableId,
}: ListCardsProps) => {
  const { setNodeRef } = useDroppable({ id: columnDroppableId });

  return (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <ol
        ref={setNodeRef}
        className="mx-[4px] my-0 flex min-h-[120px] list-none flex-col gap-2 p-0"
      >
        {cardIds.map((cardId, index) => (
          <ListCard
            key={cardId}
            cardId={cardId}
            listId={listId}
            cardIndex={index + 1}
          />
        ))}
      </ol>
    </SortableContext>
  );
};

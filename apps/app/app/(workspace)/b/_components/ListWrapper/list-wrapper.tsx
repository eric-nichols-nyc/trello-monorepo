"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { ListCards } from "../ListCards/list-cards";
import { ListHeader } from "../ListHeader/list-header";
import { ListFooter } from "./list-footer";

type ListWrapperProps = {
  boardKey: string;
  id: string;
  title: string;
  cardIds: string[];
  cardTitles: Record<string, string>;
  columnDroppableId: string;
};

export const ListWrapper = ({
  boardKey,
  id,
  title,
  cardIds,
  cardTitles,
  columnDroppableId,
}: ListWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <li
      className={`w-[270px] shrink-0 ${isDragging ? "opacity-0" : ""}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
        <ListHeader
          boardKey={boardKey}
          dragHandleProps={listeners}
          listId={id}
          onOpenCardQuickAdd={() => setQuickAddOpen(true)}
          title={title}
        />
        <ListCards
          boardKey={boardKey}
          cardIds={cardIds}
          cardTitles={cardTitles}
          columnDroppableId={columnDroppableId}
          listId={id}
        />
        <ListFooter
          boardKey={boardKey}
          listId={id}
          onQuickAddOpenChange={setQuickAddOpen}
          quickAddOpen={quickAddOpen}
        />
      </div>
    </li>
  );
};

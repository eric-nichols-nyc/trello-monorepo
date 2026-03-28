"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ListCards } from "../ListCards/list-cards";
import { ListFooter } from "./list-footer";
import { ListHeader } from "./list-header";

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

  return (
    <li
      className={`w-[270px] shrink-0 ${isDragging ? "z-10 opacity-90" : ""}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
        <ListHeader dragHandleProps={listeners} title={title} />
        <ListCards
          cardIds={cardIds}
          cardTitles={cardTitles}
          columnDroppableId={columnDroppableId}
          listId={id}
        />
        <ListFooter boardKey={boardKey} listId={id} />
      </div>
    </li>
  );
};

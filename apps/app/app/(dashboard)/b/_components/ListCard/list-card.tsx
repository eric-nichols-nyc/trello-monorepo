"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ListCardTitle } from "./list-card-title";

type ListCardProps = {
  cardId: string;
  listId: string;
  cardIndex: number;
};

export const ListCard = ({ cardId, listId, cardIndex }: ListCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex h-[45px] cursor-grab touch-none items-center rounded-[8px] bg-[rgb(36,37,40)] px-3 active:cursor-grabbing ${
        isDragging ? "z-10 opacity-90 ring-1 ring-white/20" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <ListCardTitle listId={listId} cardIndex={cardIndex} />
    </li>
  );
};

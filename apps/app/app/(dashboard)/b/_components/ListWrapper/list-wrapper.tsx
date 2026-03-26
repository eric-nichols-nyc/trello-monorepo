"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ListCards } from "../ListCards/list-cards";
import { ListFooter } from "./list-footer";
import { ListHeader } from "./list-header";

type ListWrapperProps = {
  id: string;
  title: string;
};

export const ListWrapper = ({ id, title }: ListWrapperProps) => {
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
      ref={setNodeRef}
      style={style}
      className={`w-[270px] shrink-0 ${isDragging ? "z-10 opacity-90" : ""}`}
      {...attributes}
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
        <ListHeader title={title} dragHandleProps={listeners} />
        <ListCards listId={id} />
        <ListFooter />
      </div>
    </li>
  );
};

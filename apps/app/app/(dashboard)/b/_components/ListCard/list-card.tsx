"use client";

import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ListCardTitle } from "./list-card-title";

type ListCardProps = {
  cardId: string;
  title: string;
};

export const ListCard = ({ cardId, title }: ListCardProps) => {
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
      className={`group relative flex min-h-[45px] cursor-grab touch-none items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2 active:cursor-grabbing ${
        isDragging ? "z-10 opacity-90 ring-1 ring-white/20" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <span
        className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Checkbox
          className="size-4 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600"
          aria-label={`Mark card complete: ${title}`}
        />
      </span>
      <div className="relative z-[2] min-w-0 flex-1 translate-x-0 transition-transform duration-200 ease-out group-hover:translate-x-7 group-focus-within:translate-x-7">
        <ListCardTitle title={title} />
      </div>
    </li>
  );
};

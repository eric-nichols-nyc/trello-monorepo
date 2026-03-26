"use client";

import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { ListCardTitle } from "./list-card-title";

type ListCardProps = {
  cardId: string;
  title: string;
};

export const ListCard = ({ cardId, title }: ListCardProps) => {
  const [checked, setChecked] = useState(false);

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

  const handleMouseLeave = (event: React.MouseEvent<HTMLLIElement>) => {
    if (checked) return;
    const active = document.activeElement;
    if (active && event.currentTarget.contains(active)) {
      active.blur();
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group relative flex min-h-[45px] cursor-grab touch-none items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2 active:cursor-grabbing ${
        isDragging ? "z-10 opacity-90 ring-1 ring-white/20" : ""
      }`}
      onMouseLeave={handleMouseLeave}
      {...attributes}
      {...listeners}
    >
      <span
        className={cn(
          "absolute left-3 top-1/2 z-[1] -translate-y-1/2 transition-opacity duration-150",
          checked
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
        )}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => setChecked(value === true)}
          className="size-4 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600"
          aria-label={`Mark card complete: ${title}`}
        />
      </span>
      <div
        className={cn(
          "relative z-[2] min-w-0 flex-1 transition-transform duration-200 ease-out",
          checked
            ? "translate-x-7"
            : "translate-x-0 group-hover:translate-x-7 group-focus-within:translate-x-7",
        )}
      >
        <ListCardTitle title={title} />
      </div>
    </li>
  );
};

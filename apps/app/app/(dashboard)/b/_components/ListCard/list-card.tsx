"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";
import { useState } from "react";

import {
  LIST_CARD_SURFACE_CLASSNAME,
  ListCardTitleArea,
} from "./list-card-chrome";

type ListCardProps = {
  cardId: string;
  title: string;
  listPosition?: number;
};

export const ListCard = ({ cardId, title, listPosition }: ListCardProps) => {
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

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (checked) {
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && event.currentTarget.contains(active)) {
      active.blur();
    }
  };

  return (
    <li
      className={`group relative flex list-none ${
        isDragging ? "opacity-0" : ""
      }`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {/* Blur checkbox on leave when unchecked so :focus-within does not keep it visible */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: no semantic element fits card chrome + mouseleave */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: same */}
      <div
        className={cn(
          LIST_CARD_SURFACE_CLASSNAME,
          "cursor-grab touch-none active:cursor-grabbing"
        )}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className={cn(
            "-translate-y-1/2 absolute top-1/2 left-3 z-1 transition-opacity duration-150",
            checked
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            aria-label={`Mark card complete: ${title}`}
            checked={checked}
            className="size-5 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600 [&_[data-slot=checkbox-indicator]_svg]:size-[18px]"
            onCheckedChange={(value) => setChecked(value === true)}
          />
        </span>
        <ListCardTitleArea
          className={
            checked
              ? "translate-x-7"
              : "translate-x-0 group-focus-within:translate-x-7 group-hover:translate-x-7"
          }
          listPosition={listPosition}
          title={title}
        />
      </div>
    </li>
  );
};

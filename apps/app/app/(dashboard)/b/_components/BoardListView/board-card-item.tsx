"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";
import { type MouseEvent, memo, useCallback, useState } from "react";
import type { CardPlacement } from "@/lib/board/card-list-pos";
import {
  LIST_CARD_SURFACE_CLASSNAME,
  ListCardTitleArea,
} from "../ListCard/list-card-chrome";

export type BoardCardItemProps = {
  cardId: string;
  columnId: string;
  index: number;
  title: string;
  cardPlacement?: CardPlacement;
};

export const BoardCardItem = memo(function BoardCardRow({
  cardId,
  columnId,
  index,
  title,
  cardPlacement,
}: BoardCardItemProps) {
  const [checked, setChecked] = useState(false);
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: cardId,
    index,
    group: columnId,
    type: "item",
    accept: "item",
    feedback: "clone",
  });

  const setLiRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
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
      className={cn(
        "group relative flex list-none",
        isDragging ? "opacity-0" : ""
      )}
      ref={setLiRef}
    >
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: card chrome */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: same */}
      <div
        className={cn(
          LIST_CARD_SURFACE_CLASSNAME,
          "cursor-grab touch-none active:cursor-grabbing"
        )}
        onMouseLeave={handleMouseLeave}
        ref={handleRef}
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
          cardPlacement={cardPlacement}
          className={
            checked
              ? "translate-x-7"
              : "translate-x-0 group-focus-within:translate-x-7 group-hover:translate-x-7"
          }
          listPosition={index + 1}
          title={title}
        />
      </div>
    </li>
  );
});

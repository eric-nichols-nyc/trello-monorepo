"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@repo/design-system/lib/utils";
import { memo, useCallback } from "react";

const CARD_SURFACE =
  "relative flex min-h-[45px] w-full min-w-0 flex-1 items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2";

export type DemoSortableCardProps = {
  cardId: string;
  columnId: string;
  index: number;
  title: string;
};

export const DemoSortableCard = memo(function DemoSortableCardInner({
  cardId,
  columnId,
  index,
  title,
}: DemoSortableCardProps) {
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: cardId,
    index,
    group: columnId,
    type: "item",
    accept: "item",
    feedback: "clone",
    collisionPriority: CollisionPriority.Normal,
  });

  const setLiRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  return (
    <li
      className={cn("relative flex list-none", isDragging ? "opacity-0" : "")}
      ref={setLiRef}
    >
      <div
        className={cn(
          CARD_SURFACE,
          "cursor-grab touch-none active:cursor-grabbing"
        )}
        ref={handleRef}
      >
        <span className="min-w-0 flex-1 truncate font-medium text-sm text-white/90">
          {title}
        </span>
      </div>
    </li>
  );
});

"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@repo/design-system/lib/utils";
import { GripVertical } from "lucide-react";
import { memo, useCallback, type Ref } from "react";
import { DemoSortableCard } from "./demo-sortable-card";

export type DemoSortableColumnProps = {
  columnIndex: number;
  listId: string;
  title: string;
  cardIds: string[];
  cardTitles: Record<string, string>;
  /** Show stored vs suggested list `pos` (driven by `list-column-pos`). */
  listPosDebug?: { stored: number; suggested: number };
};

export const DemoSortableColumn = memo(function DemoSortableColumnInner({
  columnIndex,
  listId,
  title,
  cardIds,
  cardTitles,
  listPosDebug,
}: DemoSortableColumnProps) {
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: listId,
    index: columnIndex,
    type: "column",
    accept: ["column", "item"],
    collisionPriority: CollisionPriority.Low,
  });

  const setColRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  return (
    <li
      className={cn("w-[270px] shrink-0", isDragging ? "opacity-0" : "")}
      ref={setColRef}
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
        <header className="mx-[4px] flex min-h-8 flex-col gap-1 pt-2 pr-2 pb-1 pl-2">
          <div className="flex items-center gap-1">
            <button
              aria-label="Drag column"
              className="-ml-1 flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white/80 active:cursor-grabbing"
              ref={handleRef as Ref<HTMLButtonElement>}
              type="button"
            >
              <GripVertical aria-hidden className="size-4 shrink-0" />
            </button>
            <span className="min-w-0 flex-1 truncate font-semibold text-sm text-white/90">
              {title}
            </span>
          </div>
          {listPosDebug === undefined ? null : (
            <p className="pl-7 font-mono text-[10px] text-white/40 leading-tight">
              pos stored {listPosDebug.stored} → suggested{" "}
              {Math.round(listPosDebug.suggested * 100) / 100}
            </p>
          )}
        </header>
        <ol className="mx-[4px] my-0 flex min-h-0 list-none flex-col gap-2 p-0">
          {cardIds.map((cardId, index) => (
            <DemoSortableCard
              cardId={cardId}
              columnId={listId}
              index={index}
              key={cardId}
              title={cardTitles[cardId] ?? "Card"}
            />
          ))}
        </ol>
        <footer className="mx-[4px] px-2 pt-1 pb-2 text-center text-white/35 text-xs">
          Demo column (not persisted)
        </footer>
      </div>
    </li>
  );
});

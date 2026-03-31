"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { cn } from "@repo/design-system/lib/utils";
import { DemoSortableColumn } from "./demo-sortable-column";
import type { NestedBoardInitialState } from "./nested-board-types";
import { useNestedBoardDrag } from "./use-nested-board-drag";

const OVERLAY_CARD =
  "relative flex min-h-[45px] w-full min-w-0 items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2";

type NestedBoardDemoProps = {
  initial: NestedBoardInitialState;
  /** Show fractional list position helper output under each column title. */
  showListPosDebug?: boolean;
  className?: string;
};

/**
 * Isolated nested board (columns + cards) for experiments and Storybook.
 * Not used by production routes.
 */
export function NestedBoardDemo({
  initial,
  showListPosDebug = true,
  className,
}: NestedBoardDemoProps) {
  const {
    listIds,
    cardsByList,
    listTitles,
    cardTitles,
    storedListPosById,
    suggestedListPosById,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useNestedBoardDrag(initial);

  return (
    <DragDropProvider
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className={cn("flex w-max items-start gap-4", className)}>
        <ul className="m-0 flex list-none gap-4 p-0">
          {listIds.map((id, columnIndex) => (
            <DemoSortableColumn
              cardIds={cardsByList[id] ?? []}
              cardTitles={cardTitles}
              columnIndex={columnIndex}
              key={id}
              listId={id}
              listPosDebug={
                showListPosDebug
                  ? {
                      stored: storedListPosById[id] ?? 0,
                      suggested: suggestedListPosById[id] ?? 0,
                    }
                  : undefined
              }
              title={listTitles[id] ?? "List"}
            />
          ))}
        </ul>
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {(source) => {
          if (!source) {
            return null;
          }
          const id = String(source.id);
          if (source.type === "column") {
            const cids = cardsByList[id] ?? [];
            return (
              <div className="pointer-events-none w-[270px] rounded-lg bg-[rgb(16,18,4)] p-2 shadow-lg ring-2 ring-white/20">
                <div className="mb-2 font-semibold text-sm text-white/90">
                  {listTitles[id] ?? "List"}
                </div>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {cids.map((cid) => (
                    <li className={OVERLAY_CARD} key={cid}>
                      <span className="truncate text-sm text-white/90">
                        {cardTitles[cid] ?? "Card"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <div className="pointer-events-none w-[262px] max-w-[calc(270px-8px)] cursor-grabbing">
              <div className="overflow-hidden rounded-[8px] shadow-lg ring-2 ring-white/20">
                <div className={OVERLAY_CARD}>
                  <span className="truncate text-sm text-white/90">
                    {cardTitles[id] ?? "Card"}
                  </span>
                </div>
              </div>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}

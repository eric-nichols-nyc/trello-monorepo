"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";
import { memo, useCallback, useState } from "react";
import type { CardPlacement } from "@/lib/board/card-list-pos";
import type { BoardDetail } from "@/types/board-detail";
import {
  LIST_CARD_SURFACE_CLASSNAME,
  ListCardChrome,
  ListCardTitleArea,
} from "../ListCard/list-card-chrome";
import { ListFooter } from "../ListWrapper/list-footer";
import { ListHeader } from "../ListWrapper/list-header";
import { ListColumnDragPreview } from "./list-column-drag-preview";
import { useBoardListsDrag } from "./use-board-lists-drag";

type BoardCardItemProps = {
  cardId: string;
  columnId: string;
  index: number;
  title: string;
  cardPlacement?: CardPlacement;
};

const BoardCardItem = memo(function BoardCardRow({
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

type BoardColumnProps = {
  boardKey: string;
  columnIndex: number;
  listId: string;
  title: string;
  cardIds: string[];
  cardTitles: Record<string, string>;
  cardPlacementById: Record<string, CardPlacement>;
  /** Optional header debug: suggested vs server `pos` for this column. */
  listPosDebug?: { suggested: number; stored: number };
};

const BoardColumn = memo(function BoardColumnFrame({
  boardKey,
  columnIndex,
  listId,
  title,
  cardIds,
  cardTitles,
  cardPlacementById,
  listPosDebug,
}: BoardColumnProps) {
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
        <ListHeader
          dragHandleRef={handleRef}
          listPosDebug={listPosDebug}
          title={title}
        />
        <ol className="mx-[4px] my-0 flex min-h-[120px] list-none flex-col gap-2 p-0">
          {cardIds.map((cardId, index) => (
            <BoardCardItem
              cardId={cardId}
              cardPlacement={cardPlacementById[cardId]}
              columnId={listId}
              index={index}
              key={cardId}
              title={cardTitles[cardId] ?? "Card"}
            />
          ))}
        </ol>
        <ListFooter boardKey={boardKey} listId={listId} />
      </div>
    </li>
  );
});

type BoardListsProps = {
  board: BoardDetail;
  boardKey: string;
};

/**
 * Nested sortable board (columns + cards). Drag state and persistence live in
 * {@link useBoardListsDrag}.
 */
export const BoardLists = ({ board, boardKey }: BoardListsProps) => {
  const {
    listIds,
    cardsByList,
    listTitles,
    cardTitles,
    listPosById,
    suggestedListPosById,
    cardPlacementById,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBoardListsDrag(board, boardKey);

  return (
    <DragDropProvider
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <ul className="flex list-none gap-4 p-0">
        {listIds.map((id, columnIndex) => (
          <BoardColumn
            boardKey={boardKey}
            cardIds={cardsByList[id] ?? []}
            cardPlacementById={cardPlacementById}
            cardTitles={cardTitles}
            columnIndex={columnIndex}
            key={id}
            listId={id}
            listPosDebug={{
              stored: listPosById[id] ?? 0,
              suggested: suggestedListPosById[id] ?? listPosById[id] ?? 0,
            }}
            title={listTitles[id] ?? "List"}
          />
        ))}
      </ul>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {(source) => {
          if (!source) {
            return null;
          }
          const id = String(source.id);
          if (source.type === "column") {
            return (
              <ListColumnDragPreview
                cardIds={cardsByList[id] ?? []}
                cardTitles={cardTitles}
                title={listTitles[id] ?? "List"}
              />
            );
          }
          const listIdForCard = listIds.find((lid) =>
            (cardsByList[lid] ?? []).includes(id)
          );
          const cardIndex =
            listIdForCard !== undefined
              ? (cardsByList[listIdForCard] ?? []).indexOf(id)
              : -1;
          let listPosition: number | undefined;
          if (cardIndex >= 0) {
            listPosition = cardIndex + 1;
          }
          return (
            <div className="pointer-events-none w-[262px] max-w-[calc(270px-8px)] cursor-grabbing">
              <div className="overflow-hidden rounded-[8px] shadow-lg ring-2 ring-white/20">
                <ListCardChrome
                  cardPlacement={cardPlacementById[id]}
                  listPosition={listPosition}
                  title={cardTitles[id] ?? "Card"}
                />
              </div>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
};

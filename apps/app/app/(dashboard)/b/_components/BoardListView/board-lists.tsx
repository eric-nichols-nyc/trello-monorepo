"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import type { BoardDetail } from "@/types/board-detail";
import { ListCardChrome } from "../ListCard/list-card-chrome";
import { ListComposer } from "../ListComposer/list-composer";
import { BoardColumn } from "./board-column";
import { ListColumnDragPreview } from "./list-column-drag-preview";
import { useBoardListsDrag } from "./use-board-lists-drag";

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
    <div className="flex min-w-0 shrink-0 items-start gap-4">
      <DragDropProvider
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <ul className="flex min-w-0 list-none gap-4 p-0">
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
      <ListComposer />
    </div>
  );
};

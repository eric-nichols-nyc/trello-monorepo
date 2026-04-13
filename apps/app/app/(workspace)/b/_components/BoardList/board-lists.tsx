"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";

import type { BoardDetail } from "@/types/board-detail";
import { ListCardDragPreview } from "../ListCard/list-card";
import { AddListColumn } from "../AddListColumn/add-list-column";
import { BoardColumn } from "./board-column";
import { ListColumnDragPreview } from "./list-column-drag-preview";
import { useBoardListsCardData } from "./use-board-lists-card-data";
import { useBoardListsDrag } from "./use-board-lists-drag";

type BoardListsProps = {
  board: BoardDetail;
  boardKey: string;
};

/**
 * Renders the horizontal list of columns plus the trailing {@link AddListColumn}.
 *
 * Wraps everything in `@dnd-kit/react`’s {@link DragDropProvider}: local order
 * (`listIds`, `cardsByList`, titles, completion) and API persistence are owned
 * by {@link useBoardListsDrag}. Card field maps + open navigation live in
 * {@link useBoardListsCardData}. Child {@link BoardColumn} / {@link ListCard}
 * wires `useSortable`; this file only supplies {@link DragOverlay} previews so
 * the cursor ghost is not a live clone of the DOM (see `ListCardDragPreview`).
 */
export const BoardLists = ({ board, boardKey }: BoardListsProps) => {
  const {
    listIds,
    cardsByList,
    listTitles,
    cardTitles,
    cardCompleted,
    setCardCompletedForId,
    setCardTitleForId,
    listPosById,
    suggestedListPosById,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBoardListsDrag(board, boardKey);

  const {
    cardAttachmentCounts,
    cardChecklists,
    cardCovers,
    cardCommentCounts,
    cardDescriptions,
    cardDueDates,
    handleOpenCard,
  } = useBoardListsCardData(board);

  return (
    <DragDropProvider
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Row fills board list height so column `max-h-full` + card scroll resolve. */}
        <div className="flex min-h-0 flex-1 w-max items-start gap-4">
          <ul className="m-0 flex h-full min-h-0 w-max list-none items-start gap-4 p-0">
            {/* Order is `listIds` from useBoardListsDrag (optimistic + server sync). */}
            {listIds.map((id, columnIndex) => (
              <BoardColumn
                boardKey={boardKey}
                cardCompleted={cardCompleted}
                cardAttachmentCounts={cardAttachmentCounts}
                cardCovers={cardCovers}
                cardChecklists={cardChecklists}
                cardDueDates={cardDueDates}
                cardCommentCounts={cardCommentCounts}
                cardDescriptions={cardDescriptions}
                cardIds={cardsByList[id] ?? []}
                cardTitles={cardTitles}
                columnIndex={columnIndex}
                key={id}
                listId={id}
                listPosDebug={{
                  stored: listPosById[id] ?? 0,
                  suggested: suggestedListPosById[id] ?? listPosById[id] ?? 0,
                }}
                onCardCompletedChange={setCardCompletedForId}
                onCardTitleChange={setCardTitleForId}
                onOpenCard={handleOpenCard}
                title={listTitles[id] ?? "List"}
              />
            ))}
          </ul>
          <AddListColumn boardId={board.id} boardKey={boardKey} />
        </div>
        {/* Portal’d layer under the pointer; not hit-tested. `source` matches the
            active sortable (column vs card). Width matches column inner track. */}
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
            const cover = cardCovers[id];
            return (
              <div className="pointer-events-none w-[262px] max-w-[calc(270px-8px)] cursor-grabbing">
                <div className="overflow-hidden rounded-[8px] shadow-lg ring-2 ring-white/20">
                  <ListCardDragPreview
                    coverColor={cover?.coverColor ?? null}
                    coverImage={cover?.coverImage ?? null}
                    title={cardTitles[id] ?? "Card"}
                  />
                </div>
              </div>
            );
          }}
        </DragOverlay>
      </div>
    </DragDropProvider>
  );
};

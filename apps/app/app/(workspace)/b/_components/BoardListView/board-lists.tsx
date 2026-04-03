"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

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
  const router = useRouter();
  const {
    listIds,
    cardsByList,
    listTitles,
    cardTitles,
    listPosById,
    suggestedListPosById,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useBoardListsDrag(board, boardKey);

  const cardPathSegments = useMemo(() => {
    const map: Record<string, string> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        map[card.id] =
          card.shortLink.length > 0 ? card.shortLink : card.id;
      }
    }
    return map;
  }, [board.lists]);

  const handleOpenCard = useCallback(
    (cardId: string) => {
      const segment = cardPathSegments[cardId];
      if (!segment) {
        return;
      }
      router.push(
        `/b/${encodeURIComponent(boardKey)}/c/${encodeURIComponent(segment)}`
      );
    },
    [boardKey, cardPathSegments, router]
  );

  return (
    <DragDropProvider
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div className="flex w-max items-start gap-4">
        <ul className="m-0 flex list-none gap-4 p-0">
          {listIds.map((id, columnIndex) => (
            <BoardColumn
              boardKey={boardKey}
              cardIds={cardsByList[id] ?? []}
              cardTitles={cardTitles}
              columnIndex={columnIndex}
              key={id}
              listId={id}
              listPosDebug={{
                stored: listPosById[id] ?? 0,
                suggested: suggestedListPosById[id] ?? listPosById[id] ?? 0,
              }}
              onOpenCard={handleOpenCard}
              title={listTitles[id] ?? "List"}
            />
          ))}
        </ul>
        <ListComposer boardId={board.id} boardKey={boardKey} />
      </div>
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
          return (
            <div className="pointer-events-none w-[262px] max-w-[calc(270px-8px)] cursor-grabbing">
              <div className="overflow-hidden rounded-[8px] shadow-lg ring-2 ring-white/20">
                <ListCardChrome title={cardTitles[id] ?? "Card"} />
              </div>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
};

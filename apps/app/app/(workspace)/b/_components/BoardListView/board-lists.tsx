"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import type { BoardDetail } from "@/types/board-detail";
import { ListCardDragPreview } from "../ListCard/list-card-front";
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
    cardCompleted,
    setCardCompletedForId,
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

  const cardDescriptions = useMemo(() => {
    const map: Record<string, string> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        if (card.description == null) {
          continue;
        }
        const text = String(card.description).trim();
        if (text.length > 0) {
          map[card.id] = text;
        }
      }
    }
    return map;
  }, [board.lists]);

  const cardAttachmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        if (card.attachmentCount > 0) {
          map[card.id] = card.attachmentCount;
        }
      }
    }
    return map;
  }, [board.lists]);

  const cardDueDates = useMemo(() => {
    const map: Record<string, Date> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        if (card.dueDate == null || card.dueDate === "") {
          continue;
        }
        const d = new Date(card.dueDate);
        if (!Number.isNaN(d.getTime())) {
          map[card.id] = d;
        }
      }
    }
    return map;
  }, [board.lists]);

  const cardCommentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        const n = card.comments.length;
        if (n > 0) {
          map[card.id] = n;
        }
      }
    }
    return map;
  }, [board.lists]);

  const cardChecklists = useMemo(() => {
    const map: Record<
      string,
      { completed: number; due: string | null; total: number }
    > = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        let total = 0;
        let completed = 0;
        for (const checklist of card.checklists) {
          for (const item of checklist.items) {
            total += 1;
            if (item.completed) {
              completed += 1;
            }
          }
        }
        if (total > 0) {
          map[card.id] = {
            completed,
            due: card.dueDate,
            total,
          };
        }
      }
    }
    return map;
  }, [board.lists]);

  const cardCovers = useMemo(() => {
    const map: Record<
      string,
      { coverColor: string | null; coverImage: string | null }
    > = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        const img =
          card.coverImage != null && String(card.coverImage).trim() !== ""
            ? card.coverImage
            : null;
        const col =
          card.coverColor != null && String(card.coverColor).trim() !== ""
            ? card.coverColor
            : null;
        if (img !== null || col !== null) {
          map[card.id] = { coverColor: col, coverImage: img };
        }
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
      router.push(`/c/${encodeURIComponent(segment)}`);
    },
    [cardPathSegments, router]
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
                <ListCardDragPreview title={cardTitles[id] ?? "Card"} />
              </div>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
};

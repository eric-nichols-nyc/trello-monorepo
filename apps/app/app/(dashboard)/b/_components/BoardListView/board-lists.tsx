"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import type { BoardDetail } from "@/types/board-detail";

import { ListWrapper } from "../ListWrapper/list-wrapper";

const COLUMN_PREFIX = "column:";

function columnDroppableId(listId: string) {
  return `${COLUMN_PREFIX}${listId}`;
}

function listIdFromColumnDroppableId(id: string): string | undefined {
  if (!id.startsWith(COLUMN_PREFIX)) return;
  return id.slice(COLUMN_PREFIX.length);
}

function findListContainingCard(
  cardsByList: Record<string, string[]>,
  listOrder: string[],
  cardId: string
): string | undefined {
  for (const listId of listOrder) {
    if (cardsByList[listId]?.includes(cardId)) return listId;
  }
  return;
}

function resolveOverListId(
  cardsByList: Record<string, string[]>,
  listOrder: string[],
  overId: string
): string | undefined {
  const fromColumn = listIdFromColumnDroppableId(overId);
  if (fromColumn) return fromColumn;
  const fromCard = findListContainingCard(cardsByList, listOrder, overId);
  if (fromCard) return fromCard;
  if (listOrder.includes(overId)) return overId;
  return;
}

function boardToListState(board: BoardDetail) {
  const sortedLists = [...board.lists].sort((a, b) => a.pos - b.pos);
  const listIds = sortedLists.map((l) => l.id);
  const cardsByList: Record<string, string[]> = {};
  const listTitles: Record<string, string> = {};
  const cardTitles: Record<string, string> = {};
  for (const list of sortedLists) {
    const cards = [...list.cards].sort((a, b) => a.pos - b.pos);
    cardsByList[list.id] = cards.map((c) => c.id);
    listTitles[list.id] = list.name;
    for (const c of cards) {
      cardTitles[c.id] = c.name;
    }
  }
  return { listIds, cardsByList, listTitles, cardTitles };
}

type BoardListsProps = {
  board: BoardDetail;
  boardKey: string;
};

function BoardDragOverlayPreview({
  activeDragId,
  listIds,
  listTitles,
  cardTitles,
}: {
  activeDragId: string;
  listIds: string[];
  listTitles: Record<string, string>;
  cardTitles: Record<string, string>;
}) {
  const isListColumn = listIds.includes(activeDragId);

  if (isListColumn) {
    return (
      <div className="pointer-events-none w-[270px] shrink-0 cursor-grabbing">
        <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)] shadow-lg ring-2 ring-white/25">
          <div className="flex items-center px-3 py-2 font-semibold text-sm text-white/95">
            {listTitles[activeDragId] ?? "List"}
          </div>
          <div className="mx-[4px] mb-2 min-h-12 rounded-md bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none w-[262px] max-w-[calc(270px-8px)] cursor-grabbing">
      <div className="flex min-h-[45px] items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2 shadow-lg ring-2 ring-white/20">
        <span className="min-w-0 truncate text-sm text-white/95">
          {cardTitles[activeDragId] ?? "Card"}
        </span>
      </div>
    </div>
  );
}

/**
 * Reads `board.lists` / cards from props (ultimately from `useBoardDetail` in
 * `BoardPageContent`). Local state mirrors that for drag-and-drop only.
 */
export const BoardLists = ({ board, boardKey }: BoardListsProps) => {
  const [listIds, setListIds] = useState<string[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, string[]>>({});
  const [listTitles, setListTitles] = useState<Record<string, string>>({});
  const [cardTitles, setCardTitles] = useState<Record<string, string>>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  useEffect(() => {
    const next = boardToListState(board);
    setListIds(next.listIds);
    setCardsByList(next.cardsByList);
    setListTitles(next.listTitles);
    setCardTitles(next.cardTitles);
  }, [board]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    if (listIds.includes(activeId) && listIds.includes(overId)) {
      setListIds((items) => {
        const from = items.indexOf(activeId);
        const to = items.indexOf(overId);
        if (from === -1 || to === -1) return items;
        return arrayMove(items, from, to);
      });
      return;
    }

    const activeListId = findListContainingCard(cardsByList, listIds, activeId);
    if (!activeListId) return;

    const overListId = resolveOverListId(cardsByList, listIds, overId);
    if (!overListId) return;

    setCardsByList((prev) => {
      if (activeListId === overListId) {
        const items = [...(prev[activeListId] ?? [])];
        const isColumnDrop =
          listIdFromColumnDroppableId(overId) === activeListId;
        const isListShellDrop = overId === activeListId;

        if (isColumnDrop || isListShellDrop) {
          const from = items.indexOf(activeId);
          if (from === -1) return prev;
          const next = [...items];
          next.splice(from, 1);
          next.push(activeId);
          return { ...prev, [activeListId]: next };
        }

        const from = items.indexOf(activeId);
        const to = items.indexOf(overId);
        if (from === -1 || to === -1) return prev;
        return {
          ...prev,
          [activeListId]: arrayMove(items, from, to),
        };
      }

      const fromList = [...(prev[activeListId] ?? [])];
      const toList = [...(prev[overListId] ?? [])];
      const fromIndex = fromList.indexOf(activeId);
      if (fromIndex === -1) return prev;

      const [moved] = fromList.splice(fromIndex, 1);

      const overIsColumn = listIdFromColumnDroppableId(overId) === overListId;
      const overIsListShell = overId === overListId;
      const insertIndex =
        overIsColumn || overIsListShell
          ? toList.length
          : Math.max(0, toList.indexOf(overId));

      toList.splice(insertIndex, 0, moved);

      return {
        ...prev,
        [activeListId]: fromList,
        [overListId]: toList,
      };
    });
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragCancel={() => setActiveDragId(null)}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
        <ul className="flex list-none gap-4 p-0">
          {listIds.map((id) => (
            <ListWrapper
              boardKey={boardKey}
              cardIds={cardsByList[id] ?? []}
              cardTitles={cardTitles}
              columnDroppableId={columnDroppableId(id)}
              id={id}
              key={id}
              title={listTitles[id] ?? "List"}
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {activeDragId === null ? null : (
          <BoardDragOverlayPreview
            activeDragId={activeDragId}
            cardTitles={cardTitles}
            listIds={listIds}
            listTitles={listTitles}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

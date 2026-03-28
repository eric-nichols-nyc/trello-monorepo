"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { BoardDetail } from "@/types/board-detail";
import { useEffect, useState } from "react";

import { ListWrapper } from "../ListWrapper/list-wrapper";

const COLUMN_PREFIX = "column:";

function columnDroppableId(listId: string) {
  return `${COLUMN_PREFIX}${listId}`;
}

function listIdFromColumnDroppableId(id: string): string | undefined {
  if (!id.startsWith(COLUMN_PREFIX)) return undefined;
  return id.slice(COLUMN_PREFIX.length);
}

function findListContainingCard(
  cardsByList: Record<string, string[]>,
  listOrder: string[],
  cardId: string,
): string | undefined {
  for (const listId of listOrder) {
    if (cardsByList[listId]?.includes(cardId)) return listId;
  }
  return undefined;
}

function resolveOverListId(
  cardsByList: Record<string, string[]>,
  listOrder: string[],
  overId: string,
): string | undefined {
  const fromColumn = listIdFromColumnDroppableId(overId);
  if (fromColumn) return fromColumn;
  const fromCard = findListContainingCard(cardsByList, listOrder, overId);
  if (fromCard) return fromCard;
  if (listOrder.includes(overId)) return overId;
  return undefined;
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
};

/**
 * Reads `board.lists` / cards from props (ultimately from `useBoardDetail` in
 * `BoardPageContent`). Local state mirrors that for drag-and-drop only.
 */
export const BoardLists = ({ board }: BoardListsProps) => {
  const [listIds, setListIds] = useState<string[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, string[]>>(
    {},
  );
  const [listTitles, setListTitles] = useState<Record<string, string>>({});
  const [cardTitles, setCardTitles] = useState<Record<string, string>>({});

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
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
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
        const isColumnDrop = listIdFromColumnDroppableId(overId) === activeListId;
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
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
        <ul className="flex list-none gap-4 p-0">
          {listIds.map((id) => (
            <ListWrapper
              key={id}
              id={id}
              title={listTitles[id] ?? "List"}
              cardIds={cardsByList[id] ?? []}
              cardTitles={cardTitles}
              columnDroppableId={columnDroppableId(id)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

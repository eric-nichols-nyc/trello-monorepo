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
import { useState } from "react";

import { listTitleFromId } from "../ListWrapper/list-title";
import { ListWrapper } from "../ListWrapper/list-wrapper";

const initialListIds = ["list-1", "list-2", "list-3", "list-4"];

const initialCardsByList: Record<string, string[]> = {
  "list-1": ["c-l1-1", "c-l1-2", "c-l1-3", "c-l1-4", "c-l1-5"],
  "list-2": ["c-l2-1", "c-l2-2", "c-l2-3", "c-l2-4", "c-l2-5"],
  "list-3": ["c-l3-1", "c-l3-2", "c-l3-3", "c-l3-4", "c-l3-5"],
  "list-4": ["c-l4-1", "c-l4-2", "c-l4-3", "c-l4-4", "c-l4-5"],
};

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
  // Pointer can hit the list column's sortable `li` instead of a card or column droppable
  if (listOrder.includes(overId)) return overId;
  return undefined;
}

export const BoardLists = () => {
  const [listIds, setListIds] = useState(initialListIds);
  const [cardsByList, setCardsByList] =
    useState<Record<string, string[]>>(initialCardsByList);

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

    // Reorder lists (ids are only on the board list order)
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
              title={listTitleFromId(id)}
              cardIds={cardsByList[id] ?? []}
              columnDroppableId={columnDroppableId(id)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

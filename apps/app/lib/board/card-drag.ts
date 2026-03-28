import { arrayMove } from "@dnd-kit/sortable";
import type { CardOrderingRow } from "@repo/schemas";
import type { CardDropPosition } from "@repo/card-positioning";

import type { BoardCard, BoardDetail } from "@/types/board-detail";

export const COLUMN_PREFIX = "column:";

export function columnDroppableId(listId: string) {
  return `${COLUMN_PREFIX}${listId}`;
}

export function listIdFromColumnDroppableId(id: string): string | undefined {
  if (!id.startsWith(COLUMN_PREFIX)) {
    return;
  }
  return id.slice(COLUMN_PREFIX.length);
}

export function findListContainingCard(
  cardsByList: Record<string, string[]>,
  listOrder: string[],
  cardId: string
): string | undefined {
  for (const listId of listOrder) {
    if (cardsByList[listId]?.includes(cardId)) {
      return listId;
    }
  }
  return;
}

export function resolveOverListId(
  cardsByList: Record<string, string[]>,
  listOrder: string[],
  overId: string
): string | undefined {
  const fromColumn = listIdFromColumnDroppableId(overId);
  if (fromColumn) {
    return fromColumn;
  }
  const fromCard = findListContainingCard(cardsByList, listOrder, overId);
  if (fromCard) {
    return fromCard;
  }
  if (listOrder.includes(overId)) {
    return overId;
  }
  return;
}

/**
 * Pure copy of board DnD card move rules: returns the next `cardsByList` map,
 * or `null` if this was a list-column drag or a no-op.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: mirrors dnd-kit sortable + column drop cases
export function computeNextCardsByListAfterCardDrag(
  listIds: string[],
  cardsByList: Record<string, string[]>,
  activeId: string,
  overId: string
): Record<string, string[]> | null {
  if (activeId === overId) {
    return null;
  }
  if (listIds.includes(activeId) && listIds.includes(overId)) {
    return null;
  }

  const activeListId = findListContainingCard(cardsByList, listIds, activeId);
  if (!activeListId) {
    return null;
  }

  const overListId = resolveOverListId(cardsByList, listIds, overId);
  if (!overListId) {
    return null;
  }

  if (activeListId === overListId) {
    const items = [...(cardsByList[activeListId] ?? [])];
    const isColumnDrop =
      listIdFromColumnDroppableId(overId) === activeListId;
    const isListShellDrop = overId === activeListId;

    if (isColumnDrop || isListShellDrop) {
      const from = items.indexOf(activeId);
      if (from === -1) {
        return null;
      }
      const next = [...items];
      next.splice(from, 1);
      next.push(activeId);
      return { ...cardsByList, [activeListId]: next };
    }

    const from = items.indexOf(activeId);
    const to = items.indexOf(overId);
    if (from === -1 || to === -1) {
      return null;
    }
    return {
      ...cardsByList,
      [activeListId]: arrayMove(items, from, to),
    };
  }

  const fromList = [...(cardsByList[activeListId] ?? [])];
  const toList = [...(cardsByList[overListId] ?? [])];
  const fromIndex = fromList.indexOf(activeId);
  if (fromIndex === -1) {
    return null;
  }

  const [moved] = fromList.splice(fromIndex, 1);

  const overIsColumn = listIdFromColumnDroppableId(overId) === overListId;
  const overIsListShell = overId === overListId;
  const insertIndex =
    overIsColumn || overIsListShell
      ? toList.length
      : Math.max(0, toList.indexOf(overId));

  toList.splice(insertIndex, 0, moved);

  return {
    ...cardsByList,
    [activeListId]: fromList,
    [overListId]: toList,
  };
}

export function boardCardsToOrderingRows(board: BoardDetail): CardOrderingRow[] {
  return board.lists.flatMap((l) =>
    l.cards.map((c) => ({ id: c.id, listId: c.listId, pos: c.pos }))
  );
}

export function mergeBoardDetailFromDrag(
  board: BoardDetail,
  nextCardsByList: Record<string, string[]>,
  updatedRows: CardOrderingRow[]
): BoardDetail {
  const baseById = new Map<string, BoardCard>();
  for (const l of board.lists) {
    for (const c of l.cards) {
      baseById.set(c.id, c);
    }
  }
  const rowById = new Map(updatedRows.map((r) => [r.id, r]));

  const lists = board.lists.map((list) => {
    const order = nextCardsByList[list.id] ?? [];
    const cards: BoardCard[] = order.map((id) => {
      const base = baseById.get(id);
      if (!base) {
        throw new Error(`mergeBoardDetailFromDrag: missing card ${id}`);
      }
      const row = rowById.get(id);
      return {
        ...base,
        listId: row?.listId ?? base.listId,
        pos: row?.pos ?? base.pos,
      };
    });
    return { ...list, cards };
  });

  return { ...board, lists };
}

export function inferCardDropParams(
  orderedCardIds: string[],
  movedCardId: string
): { dropPosition: CardDropPosition; targetCardId?: string } {
  const i = orderedCardIds.indexOf(movedCardId);
  if (i === -1) {
    throw new Error("inferCardDropParams: moved card not in ordered list");
  }
  if (orderedCardIds.length === 1) {
    return { dropPosition: "first" };
  }
  if (i === 0) {
    return { dropPosition: "first" };
  }
  if (i === orderedCardIds.length - 1) {
    return { dropPosition: "last" };
  }
  return {
    dropPosition: "before",
    targetCardId: orderedCardIds[i + 1],
  };
}

import { KanbanCardPositionCalculator } from "@repo/card-positioning";
import type { CardOrderingRow } from "@repo/schemas";
import type { BoardDetail } from "@/types/board-detail";

export type CardPlacement = { listId: string; pos: number };

function boardToOrderingRows(board: BoardDetail): CardOrderingRow[] {
  const rows: CardOrderingRow[] = [];
  for (const list of board.lists) {
    for (const c of list.cards) {
      rows.push({ id: c.id, listId: list.id, pos: c.pos });
    }
  }
  return rows;
}

function storedPosByCardId(board: BoardDetail): Record<string, number> {
  const m: Record<string, number> = {};
  for (const list of board.lists) {
    for (const c of list.cards) {
      m[c.id] = c.pos;
    }
  }
  return m;
}

/** Sorted list id → card ids as on the server (by `pos`). */
function boardOrderedCardIdsByList(
  board: BoardDetail
): Record<string, string[]> {
  const m: Record<string, string[]> = {};
  for (const list of board.lists) {
    m[list.id] = [...list.cards].sort((a, b) => a.pos - b.pos).map((c) => c.id);
  }
  return m;
}

function localListIdForCard(
  listIds: string[],
  cardsByList: Record<string, string[]>,
  cardId: string
): string | undefined {
  for (const lid of listIds) {
    if ((cardsByList[lid] ?? []).includes(cardId)) {
      return lid;
    }
  }
  return;
}

function boardListIdForCard(
  board: BoardDetail,
  cardId: string
): string | undefined {
  for (const list of board.lists) {
    if (list.cards.some((c) => c.id === cardId)) {
      return list.id;
    }
  }
  return;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Same multiset and length, sequences differ: returns the single id whose removal
 * makes the two sequences identical (one card moved within the list).
 */
function movedCardWithinList(
  boardSeq: string[],
  localSeq: string[]
): string | null {
  if (arraysEqual(boardSeq, localSeq)) {
    return null;
  }
  if (boardSeq.length !== localSeq.length) {
    return null;
  }
  const bKey = [...boardSeq].sort().join("\0");
  const lKey = [...localSeq].sort().join("\0");
  if (bKey !== lKey) {
    return null;
  }
  for (const candidate of new Set(localSeq)) {
    const b = boardSeq.filter((id) => id !== candidate);
    const l = localSeq.filter((id) => id !== candidate);
    if (arraysEqual(b, l)) {
      return candidate;
    }
  }
  return null;
}

function allCardIdsOnBoard(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>
): Set<string> {
  const ids = new Set<string>();
  for (const list of board.lists) {
    for (const c of list.cards) {
      ids.add(c.id);
    }
  }
  for (const lid of listIds) {
    for (const id of cardsByList[lid] ?? []) {
      ids.add(id);
    }
  }
  return ids;
}

/** Card that appears under a different list id locally vs on the board (single move). */
function singleCrossListMoved(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>,
  allIds: Set<string>
): { cardId: string; targetListId: string } | null {
  const crossList: string[] = [];
  for (const id of allIds) {
    const bl = boardListIdForCard(board, id);
    const ll = localListIdForCard(listIds, cardsByList, id);
    if (bl !== ll && bl !== undefined && ll !== undefined) {
      crossList.push(id);
    }
  }
  if (crossList.length !== 1) {
    return null;
  }
  const cardId = crossList[0];
  const targetListId = localListIdForCard(listIds, cardsByList, cardId);
  return targetListId ? { cardId, targetListId } : null;
}

/**
 * Detects the one card whose list or index changed vs `board` (single drag).
 */
function findMovedCard(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>
): { cardId: string; targetListId: string } | null {
  const boardByList = boardOrderedCardIdsByList(board);
  const allIds = allCardIdsOnBoard(board, listIds, cardsByList);

  const cross = singleCrossListMoved(board, listIds, cardsByList, allIds);
  if (cross) {
    return cross;
  }

  for (const listId of listIds) {
    const bSeq = boardByList[listId] ?? [];
    const lSeq = cardsByList[listId] ?? [];
    const intruder = movedCardWithinList(bSeq, lSeq);
    if (intruder) {
      return { cardId: intruder, targetListId: listId };
    }
  }

  return null;
}

/** Maps drop index to `KanbanCardPositionCalculator` drop mode (same as legacy Kanban calculator). */
function dropParamsForIndexInColumn(
  orderedIds: string[],
  movedCardId: string
): { dropPosition: "first" | "last" | "after"; targetCardId?: string } {
  const idx = orderedIds.indexOf(movedCardId);
  if (idx < 0) {
    throw new Error(`Card ${movedCardId} not found in target column order`);
  }
  const n = orderedIds.length;
  if (idx === 0) {
    return { dropPosition: "first" };
  }
  if (idx === n - 1) {
    return { dropPosition: "last" };
  }
  return { dropPosition: "after", targetCardId: orderedIds[idx - 1] };
}

/**
 * Maps each visible card to `{ listId, pos }`. When local `cardsByList` differs from
 * the server board in exactly one drag, uses {@link KanbanCardPositionCalculator}
 * (`first` / `last` / `after` + midpoint / rebalance) for that move; otherwise uses
 * stored `pos` from `board`.
 */
export function cardPlacementByLocalOrder(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>
): Record<string, CardPlacement> {
  const rows = boardToOrderingRows(board);
  const moved = findMovedCard(board, listIds, cardsByList);

  let posByCardId = storedPosByCardId(board);

  if (moved !== null && rows.some((r) => r.id === moved.cardId)) {
    const orderedIds = cardsByList[moved.targetListId] ?? [];
    const drop = dropParamsForIndexInColumn(orderedIds, moved.cardId);
    const result = KanbanCardPositionCalculator.calculatePosition({
      cards: rows,
      cardId: moved.cardId,
      targetListId: moved.targetListId,
      dropPosition: drop.dropPosition,
      targetCardId: drop.targetCardId,
    });
    posByCardId = Object.fromEntries(
      result.updatedCards.map((c) => [c.id, c.pos])
    );
  }

  const out: Record<string, CardPlacement> = {};
  for (const listId of listIds) {
    for (const id of cardsByList[listId] ?? []) {
      const pos = posByCardId[id];
      if (pos !== undefined) {
        out[id] = { listId, pos };
      }
    }
  }
  return out;
}

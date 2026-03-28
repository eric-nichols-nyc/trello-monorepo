import {
  type CardPositionResult,
  KanbanCardPositionCalculator,
} from "@repo/card-positioning";
import type { CardOrderingRow } from "@repo/schemas";
import type { BoardCard, BoardDetail } from "@/types/board-detail";

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

function runKanbanCardMove(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>
): {
  moved: { cardId: string; targetListId: string };
  result: CardPositionResult;
} | null {
  const rows = boardToOrderingRows(board);
  const moved = findMovedCard(board, listIds, cardsByList);
  if (moved === null || !rows.some((r) => r.id === moved.cardId)) {
    return null;
  }
  const orderedIds = cardsByList[moved.targetListId] ?? [];
  const drop = dropParamsForIndexInColumn(orderedIds, moved.cardId);
  const result = KanbanCardPositionCalculator.calculatePosition({
    cards: rows,
    cardId: moved.cardId,
    targetListId: moved.targetListId,
    dropPosition: drop.dropPosition,
    targetCardId: drop.targetCardId,
  });
  return { moved, result };
}

function nextBoardDetailAfterCardOrdering(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>,
  updatedRows: CardOrderingRow[]
): BoardDetail {
  const posById = new Map(updatedRows.map((r) => [r.id, r.pos]));
  const cardById = new Map<string, BoardCard>();
  for (const l of board.lists) {
    for (const c of l.cards) {
      cardById.set(c.id, c);
    }
  }
  const listMetaById = new Map(board.lists.map((l) => [l.id, l]));

  const lists = listIds.map((lid) => {
    const meta = listMetaById.get(lid);
    if (!meta) {
      throw new Error(`Missing list ${lid}`);
    }
    const ids = cardsByList[lid] ?? [];
    const cards: BoardCard[] = ids.map((id) => {
      const base = cardById.get(id);
      if (!base) {
        throw new Error(`Missing card ${id}`);
      }
      const pos = posById.get(id) ?? base.pos;
      return { ...base, listId: lid, pos };
    });
    return { ...meta, cards };
  });
  return { ...board, lists };
}

/**
 * Build optimistic board + API payload after a single-card drag. Reorder is used when
 * the calculator rebalances the target column; otherwise PATCH card `listId` + `pos`.
 */
export function cardMovePersistPayload(
  board: BoardDetail,
  listIds: string[],
  cardsByList: Record<string, string[]>
):
  | {
      variables: {
        mode: "patch";
        cardId: string;
        body: { listId: string; pos: number };
        nextBoardDetail: BoardDetail;
      };
    }
  | {
      variables: {
        mode: "reorder";
        listId: string;
        cardIds: string[];
        nextBoardDetail: BoardDetail;
      };
    }
  | null {
  const run = runKanbanCardMove(board, listIds, cardsByList);
  if (!run) {
    return null;
  }
  const { moved, result } = run;
  const nextBoardDetail = nextBoardDetailAfterCardOrdering(
    board,
    listIds,
    cardsByList,
    result.updatedCards
  );
  if (result.needsRebalancing) {
    return {
      variables: {
        mode: "reorder",
        listId: moved.targetListId,
        cardIds: cardsByList[moved.targetListId] ?? [],
        nextBoardDetail,
      },
    };
  }
  return {
    variables: {
      mode: "patch",
      cardId: moved.cardId,
      body: { listId: moved.targetListId, pos: result.newPosition },
      nextBoardDetail,
    },
  };
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
  let posByCardId = storedPosByCardId(board);

  const run = runKanbanCardMove(board, listIds, cardsByList);
  if (run !== null) {
    posByCardId = Object.fromEntries(
      run.result.updatedCards.map((c) => [c.id, c.pos])
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

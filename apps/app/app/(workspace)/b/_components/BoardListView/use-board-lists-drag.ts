"use client";

import type {
  DragEndEvent as DomDragEndHandler,
  DragOverEvent as DomDragOverHandler,
} from "@dnd-kit/abstract";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import { KeyboardSensor, PointerSensor } from "@dnd-kit/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cardMovePersistPayload } from "@/lib/board/card-list-pos";
import { suggestedListPositionsForOrder } from "@/lib/board/list-column-pos";
import {
  type MoveCardMutationVariables,
  useMoveCard,
} from "@/queries/use-move-card";
import { useUpdateList } from "@/queries/use-update-list";
import type { BoardDetail } from "@/types/board-detail";

type BoardDragOverEvent = Parameters<DomDragOverHandler>[0];
type BoardDragEndEvent = Parameters<DomDragEndHandler>[0];

type BoardDragSnapshot = {
  listIds: string[];
  cardsByList: Record<string, string[]>;
};

type DndSource = { type: string; id: string | number } | undefined;

type PersistColumnDragOpts = {
  source: DndSource;
  snap: BoardDragSnapshot | null;
  listIds: string[];
  board: BoardDetail;
  boardKey: string;
  patchList: (args: {
    listId: string;
    boardKey: string;
    updates: { pos: number };
  }) => void;
};

function persistColumnDragIfNeeded(o: PersistColumnDragOpts): void {
  if (o.source?.type !== "column" || !o.snap) {
    return;
  }
  if (!listColumnOrderChanged(o.snap.listIds, o.listIds)) {
    return;
  }
  const listId = String(o.source.id);
  const suggested = suggestedListPositionsForOrder(
    o.listIds,
    listPosMapFromBoard(o.board)
  );
  const pos = suggested[listId];
  if (pos !== undefined) {
    o.patchList({ listId, boardKey: o.boardKey, updates: { pos } });
  }
}

type PersistCardDragOpts = {
  source: DndSource;
  snap: BoardDragSnapshot | null;
  listIds: string[];
  cardsByList: Record<string, string[]>;
  board: BoardDetail;
  boardKey: string;
  moveCard: (args: MoveCardMutationVariables) => void;
};

function persistCardDragIfNeeded(o: PersistCardDragOpts): void {
  if (o.source?.type !== "item" || !o.snap) {
    return;
  }
  if (!cardsByListChanged(o.snap.cardsByList, o.cardsByList)) {
    return;
  }
  const payload = cardMovePersistPayload(o.board, o.listIds, o.cardsByList);
  if (payload !== null) {
    o.moveCard({ boardKey: o.boardKey, ...payload.variables });
  }
}

/** Local drag state: list and card order derived from `board`, sorted by `pos`. */
function boardToListState(board: BoardDetail) {
  const sortedLists = [...board.lists]
    .filter((l) => !l.closed)
    .sort((a, b) => a.pos - b.pos);
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

function listPosMapFromBoard(board: BoardDetail): Record<string, number> {
  const m: Record<string, number> = {};
  for (const l of board.lists) {
    m[l.id] = l.pos;
  }
  return m;
}

function listColumnOrderChanged(before: string[], after: string[]): boolean {
  if (before.length !== after.length) {
    return true;
  }
  for (let i = 0; i < before.length; i++) {
    if (before[i] !== after[i]) {
      return true;
    }
  }
  return false;
}

function idSequencesEqual(a: string[], b: string[]): boolean {
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

function cardsByListChanged(
  before: Record<string, string[]>,
  after: Record<string, string[]>
): boolean {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    if (!idSequencesEqual(before[k] ?? [], after[k] ?? [])) {
      return true;
    }
  }
  return false;
}

function boardStructureFingerprint(board: BoardDetail): string {
  const lists = [...board.lists].sort((a, b) => a.pos - b.pos);
  return lists
    .map((l) => {
      const cards = [...l.cards].sort((a, b) => a.pos - b.pos);
      const cardPart = cards.map((c) => `${c.id}\t${c.name}`).join("\n");
      return `${l.id}\t${l.name}\n${cardPart}`;
    })
    .join("\n---\n");
}

/**
 * Local column/card order for {@link BoardLists}, drag snapshot + `move()` handlers,
 * and persistence (`useUpdateList` / `useMoveCard`).
 */
export function useBoardListsDrag(board: BoardDetail, boardKey: string) {
  const { mutate: patchList } = useUpdateList();
  const { mutate: moveCard } = useMoveCard();

  const [listIds, setListIds] = useState<string[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, string[]>>({});
  const [listTitles, setListTitles] = useState<Record<string, string>>({});
  const [cardTitles, setCardTitles] = useState<Record<string, string>>({});

  const listIdsRef = useRef(listIds);
  const cardsByListRef = useRef(cardsByList);
  listIdsRef.current = listIds;
  cardsByListRef.current = cardsByList;

  const boardRef = useRef(board);
  boardRef.current = board;

  const snapshotRef = useRef<BoardDragSnapshot | null>(null);

  const structureFingerprint = boardStructureFingerprint(board);

  const listPosById = useMemo(() => listPosMapFromBoard(board), [board]);

  const suggestedListPosById = useMemo(
    () => suggestedListPositionsForOrder(listIds, listPosById),
    [listIds, listPosById]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: fingerprint gate vs `board` identity
  useEffect(() => {
    const next = boardToListState(boardRef.current);
    setListIds(next.listIds);
    setCardsByList(next.cardsByList);
    setListTitles(next.listTitles);
    setCardTitles(next.cardTitles);
  }, [structureFingerprint]);

  const sensors = useMemo(
    () => [
      PointerSensor.configure({
        activationConstraints: [
          new PointerActivationConstraints.Distance({ value: 8 }),
        ],
        activatorElements: (source) =>
          [source.element, source.handle].filter(Boolean) as Element[],
      }),
      KeyboardSensor,
    ],
    []
  );

  const restoreSnapshot = useCallback(() => {
    const snap = snapshotRef.current;
    if (!snap) {
      return;
    }
    setListIds(snap.listIds);
    setCardsByList(snap.cardsByList);
    snapshotRef.current = null;
  }, []);

  const handleDragStart = useCallback(() => {
    snapshotRef.current = {
      listIds: [...listIdsRef.current],
      cardsByList: Object.fromEntries(
        listIdsRef.current.map((id) => [
          id,
          [...(cardsByListRef.current[id] ?? [])],
        ])
      ),
    };
  }, []);

  const handleDragOver = useCallback((event: BoardDragOverEvent) => {
    const source = event.operation.source;
    if (!source) {
      return;
    }
    if (source.type === "column") {
      setListIds((ids) => move(ids, event));
      return;
    }
    setCardsByList((items) => move(items, event));
  }, []);

  const handleDragEnd = useCallback(
    (event: BoardDragEndEvent) => {
      if (event.canceled) {
        restoreSnapshot();
        return;
      }

      const source = event.operation.source as DndSource;
      const snap = snapshotRef.current;

      persistColumnDragIfNeeded({
        source,
        snap,
        listIds: listIdsRef.current,
        board: boardRef.current,
        boardKey,
        patchList,
      });
      persistCardDragIfNeeded({
        source,
        snap,
        listIds: listIdsRef.current,
        cardsByList: cardsByListRef.current,
        board: boardRef.current,
        boardKey,
        moveCard,
      });

      snapshotRef.current = null;
    },
    [boardKey, moveCard, patchList, restoreSnapshot]
  );

  return {
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
  };
}

export type UseBoardListsDragResult = ReturnType<typeof useBoardListsDrag>;

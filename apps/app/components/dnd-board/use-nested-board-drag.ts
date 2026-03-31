"use client";

/**
 * Demo-only drag state (no API). Same `move()` pattern as production; see README
 * in this folder for the order vs `pos` split.
 */
import type {
  DragEndEvent as DomDragEndHandler,
  DragOverEvent as DomDragOverHandler,
} from "@dnd-kit/abstract";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import { KeyboardSensor, PointerSensor } from "@dnd-kit/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { suggestedListPositionsForOrder } from "../../lib/board/list-column-pos";
import type { NestedBoardInitialState } from "./nested-board-types";

type BoardDragOverEvent = Parameters<DomDragOverHandler>[0];
type BoardDragEndEvent = Parameters<DomDragEndHandler>[0];

type BoardDragSnapshot = {
  listIds: string[];
  cardsByList: Record<string, string[]>;
};

/**
 * Local-only nested board drag (columns + cards) using the same `move()` flow as
 * production board drag hook, without React Query or API calls.
 */
export function useNestedBoardDrag(initial: NestedBoardInitialState) {
  const [listIds, setListIds] = useState<string[]>(() => [...initial.listIds]);
  const [cardsByList, setCardsByList] = useState<Record<string, string[]>>(() => ({
    ...initial.cardsByList,
  }));
  const listTitles = initial.listTitles;
  const cardTitles = initial.cardTitles;
  const storedListPosById = initial.listPosById ?? {};

  const listIdsRef = useRef(listIds);
  const cardsByListRef = useRef(cardsByList);
  listIdsRef.current = listIds;
  cardsByListRef.current = cardsByList;

  const snapshotRef = useRef<BoardDragSnapshot | null>(null);

  const suggestedListPosById = useMemo(
    () => suggestedListPositionsForOrder(listIds, storedListPosById),
    [listIds, storedListPosById]
  );

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
      snapshotRef.current = null;
    },
    [restoreSnapshot]
  );

  return {
    listIds,
    cardsByList,
    listTitles,
    cardTitles,
    storedListPosById,
    suggestedListPosById,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

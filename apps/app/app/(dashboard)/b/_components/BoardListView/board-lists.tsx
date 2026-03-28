"use client";

import {
  CollisionPriority,
  type DragEndEvent as DomDragEndHandler,
  type DragOverEvent as DomDragOverHandler,
} from "@dnd-kit/abstract";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type CardPlacement,
  cardPlacementByLocalOrder,
} from "@/lib/board/card-list-pos";
import { suggestedListPositionsForOrder } from "@/lib/board/list-column-pos";
import { useUpdateList } from "@/queries/use-update-list";
import type { BoardDetail } from "@/types/board-detail";
import {
  LIST_CARD_SURFACE_CLASSNAME,
  ListCardChrome,
  ListCardTitleArea,
} from "../ListCard/list-card-chrome";
import { ListFooter } from "../ListWrapper/list-footer";
import { ListHeader } from "../ListWrapper/list-header";
import { ListColumnDragPreview } from "./list-column-drag-preview";

type BoardDragOverEvent = Parameters<DomDragOverHandler>[0];
type BoardDragEndEvent = Parameters<DomDragEndHandler>[0];

/** Local drag state: list and card order derived from `board`, sorted by `pos`. */
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

/** Stored `pos` per list id — input to {@link suggestedListPositionsForOrder}. */
function listPosMapFromBoard(board: BoardDetail): Record<string, number> {
  const m: Record<string, number> = {};
  for (const l of board.lists) {
    m[l.id] = l.pos;
  }
  return m;
}

/** True if column id sequences differ (avoids no-op PATCH after drag release). */
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

type BoardCardItemProps = {
  cardId: string;
  columnId: string;
  index: number;
  title: string;
  cardPlacement?: CardPlacement;
};

const BoardCardItem = memo(function BoardCardRow({
  cardId,
  columnId,
  index,
  title,
  cardPlacement,
}: BoardCardItemProps) {
  const [checked, setChecked] = useState(false);
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: cardId,
    index,
    group: columnId,
    type: "item",
    accept: "item",
    feedback: "clone",
  });

  const setLiRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (checked) {
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && event.currentTarget.contains(active)) {
      active.blur();
    }
  };

  return (
    <li
      className={cn(
        "group relative flex list-none",
        isDragging ? "opacity-0" : ""
      )}
      ref={setLiRef}
    >
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: card chrome */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: same */}
      <div
        className={cn(
          LIST_CARD_SURFACE_CLASSNAME,
          "cursor-grab touch-none active:cursor-grabbing"
        )}
        onMouseLeave={handleMouseLeave}
        ref={handleRef}
      >
        <span
          className={cn(
            "-translate-y-1/2 absolute top-1/2 left-3 z-1 transition-opacity duration-150",
            checked
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            aria-label={`Mark card complete: ${title}`}
            checked={checked}
            className="size-5 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600 [&_[data-slot=checkbox-indicator]_svg]:size-[18px]"
            onCheckedChange={(value) => setChecked(value === true)}
          />
        </span>
        <ListCardTitleArea
          cardPlacement={cardPlacement}
          className={
            checked
              ? "translate-x-7"
              : "translate-x-0 group-focus-within:translate-x-7 group-hover:translate-x-7"
          }
          listPosition={index + 1}
          title={title}
        />
      </div>
    </li>
  );
});

type BoardColumnProps = {
  boardKey: string;
  columnIndex: number;
  listId: string;
  title: string;
  cardIds: string[];
  cardTitles: Record<string, string>;
  cardPlacementById: Record<string, CardPlacement>;
  /** Optional header debug: suggested vs server `pos` for this column. */
  listPosDebug?: { suggested: number; stored: number };
};

const BoardColumn = memo(function BoardColumnFrame({
  boardKey,
  columnIndex,
  listId,
  title,
  cardIds,
  cardTitles,
  cardPlacementById,
  listPosDebug,
}: BoardColumnProps) {
  const { ref, targetRef, handleRef, isDragging } = useSortable({
    id: listId,
    index: columnIndex,
    type: "column",
    accept: ["column", "item"],
    collisionPriority: CollisionPriority.Low,
  });

  const setColRef = useCallback(
    (node: HTMLLIElement | null) => {
      ref(node);
      targetRef(node);
    },
    [ref, targetRef]
  );

  return (
    <li
      className={cn("w-[270px] shrink-0", isDragging ? "opacity-0" : "")}
      ref={setColRef}
    >
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)]">
        <ListHeader
          dragHandleRef={handleRef}
          listPosDebug={listPosDebug}
          title={title}
        />
        <ol className="mx-[4px] my-0 flex min-h-[120px] list-none flex-col gap-2 p-0">
          {cardIds.map((cardId, index) => (
            <BoardCardItem
              cardId={cardId}
              cardPlacement={cardPlacementById[cardId]}
              columnId={listId}
              index={index}
              key={cardId}
              title={cardTitles[cardId] ?? "Card"}
            />
          ))}
        </ol>
        <ListFooter boardKey={boardKey} listId={listId} />
      </div>
    </li>
  );
});

type BoardListsProps = {
  board: BoardDetail;
  boardKey: string;
};

/**
 * Nested sortable board (columns + cards) with `@dnd-kit/react` + `move()` on
 * `onDragOver`. Local state mirrors `board` until the server changes; column
 * reorder persists via `useUpdateList` on successful column drag (see `handleDragEnd`).
 *
 * Refs (`listIdsRef`, `boardRef`) supply latest order and stored positions inside
 * drag callbacks, which close over stale React state otherwise.
 */
export const BoardLists = ({ board, boardKey }: BoardListsProps) => {
  /** Persists column `pos` after drag; optimistic updates use the same `boardKey`. */
  const { mutate: patchList } = useUpdateList();

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

  /** Captured at drag start; used to cancel column/card moves or to detect column reorder. */
  const snapshotRef = useRef<{
    listIds: string[];
    cardsByList: Record<string, string[]>;
  } | null>(null);

  const structureFingerprint = boardStructureFingerprint(board);

  const listPosById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const l of board.lists) {
      m[l.id] = l.pos;
    }
    return m;
  }, [board]);

  const suggestedListPosById = useMemo(
    () => suggestedListPositionsForOrder(listIds, listPosById),
    [listIds, listPosById]
  );

  const cardPlacementById = useMemo(
    () => cardPlacementByLocalOrder(board, listIds, cardsByList),
    [board, listIds, cardsByList]
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

      const source = event.operation.source;
      const snap = snapshotRef.current;

      // Column: PATCH only the dragged list with a fractional pos between neighbors’ stored values.
      if (source?.type === "column" && snap) {
        const newIds = listIdsRef.current;
        if (listColumnOrderChanged(snap.listIds, newIds)) {
          const listId = String(source.id);
          const suggested = suggestedListPositionsForOrder(
            newIds,
            listPosMapFromBoard(boardRef.current)
          );
          const pos = suggested[listId];
          if (pos !== undefined) {
            patchList({
              listId,
              boardKey,
              updates: { pos },
            });
          }
        }
      }

      snapshotRef.current = null;
    },
    [boardKey, patchList, restoreSnapshot]
  );

  return (
    <DragDropProvider
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <ul className="flex list-none gap-4 p-0">
        {listIds.map((id, columnIndex) => (
          <BoardColumn
            boardKey={boardKey}
            cardIds={cardsByList[id] ?? []}
            cardPlacementById={cardPlacementById}
            cardTitles={cardTitles}
            columnIndex={columnIndex}
            key={id}
            listId={id}
            listPosDebug={{
              stored: listPosById[id] ?? 0,
              suggested: suggestedListPosById[id] ?? listPosById[id] ?? 0,
            }}
            title={listTitles[id] ?? "List"}
          />
        ))}
      </ul>
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
          const listIdForCard = listIds.find((lid) =>
            (cardsByList[lid] ?? []).includes(id)
          );
          const cardIndex =
            listIdForCard !== undefined
              ? (cardsByList[listIdForCard] ?? []).indexOf(id)
              : -1;
          let listPosition: number | undefined;
          if (cardIndex >= 0) {
            listPosition = cardIndex + 1;
          }
          return (
            <div className="pointer-events-none w-[262px] max-w-[calc(270px-8px)] cursor-grabbing">
              <div className="overflow-hidden rounded-[8px] shadow-lg ring-2 ring-white/20">
                <ListCardChrome
                  cardPlacement={cardPlacementById[id]}
                  listPosition={listPosition}
                  title={cardTitles[id] ?? "Card"}
                />
              </div>
            </div>
          );
        }}
      </DragOverlay>
    </DragDropProvider>
  );
};

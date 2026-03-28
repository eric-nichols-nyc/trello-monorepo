"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@repo/design-system/lib/utils";
import { memo, useCallback } from "react";
import type { CardPlacement } from "@/lib/board/card-list-pos";
import { ListFooter } from "../ListWrapper/list-footer";
import { ListHeader } from "../ListWrapper/list-header";
import { BoardCardItem } from "./board-card-item";

export type BoardColumnProps = {
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

export const BoardColumn = memo(function BoardColumnFrame({
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

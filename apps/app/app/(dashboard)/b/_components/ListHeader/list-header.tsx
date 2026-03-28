import { GripVertical } from "lucide-react";
import type { HTMLAttributes, Ref } from "react";

import { ListTitle } from "../ListTitle/list-title";

type ListHeaderProps = {
  title: string;
  /** When both are set, the list title is editable (PATCH list name). */
  listId?: string;
  boardKey?: string;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  /** `@dnd-kit/react` sortable column handle (callback ref). */
  dragHandleRef?: (element: Element | null) => void;
  /** Debug: suggested `List.pos` for current column order vs stored `storedListPos`. */
  listPosDebug?: { suggested: number; stored: number };
};

export const ListHeader = ({
  boardKey,
  title,
  listId,
  dragHandleProps,
  dragHandleRef,
  listPosDebug,
}: ListHeaderProps) => (
  <header className="mx-[4px] flex h-[32px] items-center gap-1 pt-[8px] pr-[8px] pl-[8px]">
    <button
      aria-label="Drag list"
      className="-ml-1 flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white/80 active:cursor-grabbing"
      ref={dragHandleRef as Ref<HTMLButtonElement> | undefined}
      type="button"
      {...dragHandleProps}
    >
      <GripVertical aria-hidden className="size-4 shrink-0" />
    </button>
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ListTitle boardKey={boardKey} listId={listId} title={title} />
      {listPosDebug ? (
        <span
          className="shrink-0 font-mono text-[10px] text-emerald-400/90 leading-none"
          title={`Stored pos: ${listPosDebug.stored}\nSuggested pos (from order): ${listPosDebug.suggested}`}
        >
          {listPosDebug.suggested.toFixed(2)}
          {Math.abs(listPosDebug.suggested - listPosDebug.stored) > 0.01 ? (
            <span className="ml-1 text-white/35">
              ←{listPosDebug.stored.toFixed(0)}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  </header>
);

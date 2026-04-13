import { GripVertical } from "lucide-react";
import type { HTMLAttributes, Ref } from "react";

import { ListTitle } from "../ListTitle/list-title";

import { OverflowMenu } from "./overflow-menu";

type ListHeaderProps = {
  title: string;
  /** When both are set, the list title is editable (PATCH list name). */
  listId?: string;
  boardKey?: string;
  /** Opens the list footer card composer (header overflow “Add card”). */
  onOpenCardQuickAdd?: () => void;
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
  onOpenCardQuickAdd,
}: ListHeaderProps) => (
  <header className="mx-[4px] flex h-[32px] shrink-0 items-center gap-1 pt-[8px] pr-[8px] pl-[8px]">
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
    </div>
    {!!boardKey && !!listId && !!onOpenCardQuickAdd ? (
      <OverflowMenu
        boardKey={boardKey}
        listId={listId}
        listTitle={title}
        onAddCard={onOpenCardQuickAdd}
      />
    ) : null}
  </header>
);

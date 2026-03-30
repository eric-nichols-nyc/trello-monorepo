"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { Ellipsis } from "lucide-react";

import { AddCardButton } from "./add-card-button";
import { ArchiveListButton } from "./archive-list-button";
import { DeleteListButton } from "./delete-list-button";

type OverflowMenuProps = {
  boardKey: string;
  listId: string;
  /** Used for the trigger `aria-label`. */
  listTitle: string;
  onAddCard: () => void;
  className?: string;
};

export function OverflowMenu({
  boardKey,
  className,
  listId,
  listTitle,
  onAddCard,
}: OverflowMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`List actions: ${listTitle}`}
          className={cn(
            "flex shrink-0 items-center justify-center rounded p-0.5 text-white/50 transition-colors",
            "hover:bg-white/10 hover:text-white/80",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/25",
            "data-[state=open]:bg-white/10 data-[state=open]:text-white/80",
            className
          )}
          type="button"
        >
          <Ellipsis aria-hidden className="size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-40"
        onCloseAutoFocus={(event) => event.preventDefault()}
        side="right"
        sideOffset={4}
      >
        <AddCardButton onSelect={onAddCard} />
        <DropdownMenuSeparator />
        <ArchiveListButton boardKey={boardKey} listId={listId} />
        <DeleteListButton boardKey={boardKey} listId={listId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

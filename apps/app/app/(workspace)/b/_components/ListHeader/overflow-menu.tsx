"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { Ellipsis, X } from "lucide-react";
import { useState } from "react";

import { AddCardButton } from "./add-card-button";
import { ArchiveListButton } from "./archive-list-button";

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
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
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
        className={cn(
          "box-border w-[var(--list-overflow-menu-width)] min-w-[var(--list-overflow-menu-width)] max-w-[var(--list-overflow-menu-width)]",
          "border-0 bg-transparent gap-0 p-0 shadow-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "[&_[data-slot=dropdown-menu-item]]:focus:bg-white/10 [&_[data-slot=dropdown-menu-item]]:focus:text-white [&_[data-slot=dropdown-menu-item]]:text-white/90",
          "[&_[data-slot=dropdown-menu-item]]:data-[variant=destructive]:focus:bg-red-500/15 [&_[data-slot=dropdown-menu-item]]:data-[variant=destructive]:focus:text-red-200 [&_[data-slot=dropdown-menu-item]]:data-[variant=destructive]:text-red-300",
          "[&_[data-slot=dropdown-menu-item]_svg]:text-white/70 [&_[data-slot=dropdown-menu-item]]:focus:[&_svg]:text-white"
        )}
        onCloseAutoFocus={(event) => event.preventDefault()}
        side="right"
        sideOffset={4}
      >
        <Card
          className={cn(
            "gap-0 overflow-hidden border-white/10 bg-[var(--board-menu-card-bg)] px-[var(--board-menu-card-padding-inline)] py-0 text-white/90 shadow-md",
            "w-full min-w-0 rounded-md"
          )}
        >
          <CardHeader className="border-white/10 border-b px-0 py-0">
            <div className="relative flex items-center justify-center py-3 pr-10">
              <CardTitle className="text-center font-semibold text-sm text-white">
                List actions
              </CardTitle>
              <Button
                aria-label="Close list actions"
                className="-translate-y-1/2 absolute top-1/2 right-0 size-8 shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setOpen(false);
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X aria-hidden className="size-4" strokeWidth={2} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 py-1">
            <AddCardButton onSelect={onAddCard} />
            <DropdownMenuSeparator className="-mx-[var(--board-menu-card-padding-inline)] bg-white/10" />
            <ArchiveListButton boardKey={boardKey} listId={listId} />
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

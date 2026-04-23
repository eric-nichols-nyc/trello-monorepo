"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { cn } from "@repo/design-system/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";

const CURRENT_BOARD_VALUE = "__current_board__";

export type MoveCardPopoverProps = {
  boardLists: CardRouteBoardList[];
  boardName: string;
  currentListId: string;
  listName: string;
  /** Wider pill trigger + typography for {@link CardBackCover} top bar. */
  variant?: "default" | "cover";
};

export function MoveCardPopover({
  boardLists,
  boardName,
  currentListId,
  listName,
  variant = "default",
}: MoveCardPopoverProps) {
  const [open, setOpen] = useState(false);

  const listSelectDefault = useMemo(() => {
    if (boardLists.some((l) => l.id === currentListId)) {
      return currentListId;
    }
    return boardLists[0]?.id ?? currentListId;
  }, [boardLists, currentListId]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "font-semibold text-sm card-back-actions-menu__trigger h-auto max-w-full gap-2 p-1 text-left",
            variant === "cover"
              ? "min-h-4 items-center rounded-lg bg-(--card-back-move-popover-bg) text-white hover:bg-(--card-back-actions-menu-hover-bg) hover:text-white"
              : "min-h-4 max-w-full items-start whitespace-normal text-zinc-300 hover:text-zinc-100",
          )}
          size="sm"
          title={`${listName}`}
          type="button"
          variant="ghost"
        >
          <span
            className={cn(
              "min-w-0 flex-1 text-left leading-tight",
              variant === "cover" ? "max-w-[min(100%,600px)]" : "max-w-44",
            )}
          >
            <span
              className={cn(
                "block",
                variant === "cover"
                  ? "truncate text-sm font-semibold text-white"
                  : "wrap-break-word font-semibold text-sm text-zinc-100",
              )}
            >
              {listName}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0",
              variant === "cover"
                ? "opacity-70"
                : "mt-0.5 self-start",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="card-back-actions-menu__popover w-[min(calc(100vw-2rem),22rem)] border-zinc-800 p-0 text-zinc-100 shadow-xl"
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest?.('[data-slot="select-content"]')) {
            event.preventDefault();
          }
        }}
        sideOffset={8}
      >
        <div className="relative flex items-center justify-center border-zinc-800 border-b px-10 py-3">
          <h2 className="font-semibold text-sm">Move card</h2>
          <Button
            className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-md border border-sky-500/40 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={() => setOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <span className="sr-only">Close</span>
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <p className="font-medium text-[11px] text-zinc-500 uppercase tracking-wide">
            Select destination
          </p>

          <div className="space-y-1.5">
            <span className="block font-semibold text-sm text-zinc-300">
              Board
            </span>
            <Select defaultValue={CURRENT_BOARD_VALUE} disabled>
              <SelectTrigger className="h-9 w-full cursor-not-allowed border-zinc-700 bg-(--card-back-move-popover-field-bg) text-zinc-100 opacity-70 shadow-none">
                <SelectValue placeholder="Board" />
              </SelectTrigger>
              <SelectContent className="card-back-actions-menu__select-content border-zinc-700 text-zinc-100">
                <SelectItem value={CURRENT_BOARD_VALUE}>{boardName}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_4.5rem]">
            <div className="min-w-0 space-y-1.5">
              <span className="block font-semibold text-sm text-zinc-300">
                List
              </span>
              <Select defaultValue={listSelectDefault}>
                <SelectTrigger className="h-9 w-full border-zinc-700 bg-(--card-back-move-popover-field-bg) text-zinc-100 shadow-none">
                  <SelectValue placeholder="List" />
                </SelectTrigger>
                <SelectContent className="card-back-actions-menu__select-content border-zinc-700 text-zinc-100">
                  {boardLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <span className="block font-semibold text-sm text-zinc-300">
                Position
              </span>
              <Select defaultValue="1" disabled>
                <SelectTrigger className="h-9 w-full border-zinc-700 bg-(--card-back-move-popover-field-bg) text-zinc-100 shadow-none">
                  <SelectValue placeholder="#" />
                </SelectTrigger>
                <SelectContent className="card-back-actions-menu__select-content border-zinc-700 text-zinc-100">
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="11">11</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-zinc-800 border-t pt-4">
            <Button
              className="bg-sky-400 font-semibold text-black hover:bg-sky-300"
              type="button"
            >
              Move
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

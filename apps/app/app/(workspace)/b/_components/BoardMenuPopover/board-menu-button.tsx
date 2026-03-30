"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { Ellipsis } from "lucide-react";
import { useState } from "react";

import { BoardMenuPopover } from "./board-menu-popover";

type BoardMenuButtonProps = {
  /** For `aria-label` / future analytics. */
  boardName: string;
  className?: string;
};

export function BoardMenuButton({
  boardName,
  className,
}: BoardMenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`Board menu: ${boardName}`}
          className={cn(
            "flex shrink-0 items-center justify-center rounded p-1 text-white/70 transition-colors",
            "hover:bg-white/10 hover:text-white",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/30",
            "data-[state=open]:bg-white/10 data-[state=open]:text-white",
            className
          )}
          type="button"
        >
          <Ellipsis aria-hidden className="size-5 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto min-w-0 border-0 bg-transparent p-0 shadow-none"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        side="bottom"
        sideOffset={6}
      >
        <BoardMenuPopover onDismiss={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

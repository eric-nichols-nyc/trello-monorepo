"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { Activity, Archive, Info, X } from "lucide-react";
import type { BoardBackgroundStyleSource } from "@/lib/board/get-board-background-style";

import { ChangeBackgroundMenuButton } from "./change-background-menu-button";
import { CloseBoardButton } from "./close-board-button";
import { StarBoardButton } from "./star-board-button";

export type BoardMenuPopoverProps = {
  boardBackground: BoardBackgroundStyleSource;
  boardName?: string;
  /** Called only from explicit dismiss controls (header X, footer Close). */
  onDismiss?: () => void;
  className?: string;
};

const menuButtonClass = cn(
  "h-auto w-full justify-start rounded-sm px-2 py-2 font-normal",
  "text-white/90 hover:bg-white/10 hover:text-white"
);

/**
 * Board overflow actions in a {@link Card} shell with a titled header (wiring TBD).
 */
export function BoardMenuPopover({
  boardBackground,
  boardName,
  className,
  onDismiss,
}: BoardMenuPopoverProps) {
  const dismiss = () => {
    onDismiss?.();
  };

  return (
    <Card
      className={cn(
        "box-border w-[var(--board-menu-card-width)] max-w-[var(--board-menu-card-width)] shrink-0 gap-0 overflow-visible border border-white/10 bg-[var(--board-menu-card-bg)] px-[var(--board-menu-card-padding-inline)] py-0 text-white/90 shadow-md",
        className
      )}
    >
      <CardHeader className="border-b px-0 py-0">
        <div className="relative flex items-center justify-center py-3 pr-10">
          <CardTitle className="text-center font-semibold text-sm text-white">
            Menu
          </CardTitle>
          <Button
            aria-label="Close menu"
            className="-translate-y-1/2 absolute top-1/2 right-0 size-8 shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={dismiss}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X aria-hidden className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-1 pb-2">
        <div className="flex flex-col gap-0.5">
          <Button className={menuButtonClass} type="button" variant="ghost">
            <Info aria-hidden className="size-4 shrink-0" strokeWidth={2} />
            About this board
          </Button>
          <StarBoardButton />
          <ChangeBackgroundMenuButton boardBackground={boardBackground} />
          <Button
            className={menuButtonClass}
            disabled
            type="button"
            variant="ghost"
          >
            <Activity aria-hidden className="size-4 shrink-0" strokeWidth={2} />
            Activitiy
          </Button>
          <Button
            className={menuButtonClass}
            disabled
            type="button"
            variant="ghost"
          >
            <Archive aria-hidden className="size-4 shrink-0" strokeWidth={2} />
            Archived items
          </Button>
          <CloseBoardButton boardName={boardName} />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import {
  type BoardBackgroundStyleSource,
  getBoardBackgroundStyle,
} from "@/lib/board/get-board-background-style";

const menuButtonClass = cn(
  "h-auto w-full justify-start gap-2 rounded-sm px-2 py-2 font-normal",
  "text-white/90 hover:bg-white/10 hover:text-white"
);

export type ChangeBackgroundMenuButtonProps = {
  boardBackground: BoardBackgroundStyleSource;
  className?: string;
};

export function ChangeBackgroundMenuButton({
  boardBackground,
  className,
}: ChangeBackgroundMenuButtonProps) {
  return (
    <Button
      className={cn(menuButtonClass, className)}
      type="button"
      variant="ghost"
    >
      <span
        aria-hidden
        className="size-7 shrink-0 rounded border border-white/20 bg-center bg-cover bg-no-repeat shadow-inner ring-1 ring-black/20"
        style={getBoardBackgroundStyle(boardBackground)}
      />
      Change background
    </Button>
  );
}

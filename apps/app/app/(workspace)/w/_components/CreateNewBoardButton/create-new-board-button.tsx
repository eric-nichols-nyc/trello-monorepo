"use client";

import { Card } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";

export type CreateNewBoardButtonProps = {
  readonly className?: string;
  /** Shown as “{n} remaining” under the title (Trello-style quota hint). */
  readonly boardsRemaining?: number;
};

export function CreateNewBoardButton({
  className,
  boardsRemaining = 3,
}: CreateNewBoardButtonProps) {
  return (
    <button
      aria-label={`Create new board, ${boardsRemaining} remaining`}
      className={cn(
        "block w-full rounded-xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      onClick={() => {
        console.log("Create new board");
      }}
      type="button"
    >
      <Card
        className="flex h-[120px] flex-col items-center justify-center gap-0.5 rounded-xl border border-black/15 bg-[#454545] py-0 shadow-sm transition-shadow hover:shadow-md dark:border-white/15 dark:bg-[#3d3d3d]"
      >
        <span className="px-3 font-medium text-[15px] text-white leading-snug">
          Create new board
        </span>
        <span className="px-3 text-[13px] text-white/85 leading-snug">
          {boardsRemaining} remaining
        </span>
      </Card>
    </button>
  );
}

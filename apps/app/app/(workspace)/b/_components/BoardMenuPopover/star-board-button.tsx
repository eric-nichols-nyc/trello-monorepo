"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

const menuButtonClass = cn(
  "h-auto w-full justify-start rounded-sm px-2 py-2 font-normal",
  "text-white/90 hover:bg-white/10 hover:text-white"
);

export type StarBoardButtonProps = {
  className?: string;
};

export function StarBoardButton({ className }: StarBoardButtonProps) {
  const [starred, setStarred] = useState(false);

  return (
    <Button
      aria-pressed={starred}
      className={cn(menuButtonClass, className)}
      onClick={() => {
        setStarred((previous) => !previous);
      }}
      type="button"
      variant="ghost"
    >
      <Star
        aria-hidden
        className="size-4 shrink-0 text-amber-400"
        fill={starred ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {starred ? "Unstar" : "Star"}
    </Button>
  );
}

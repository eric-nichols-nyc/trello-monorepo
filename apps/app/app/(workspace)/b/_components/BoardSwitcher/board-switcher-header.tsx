"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { List, Pin, Search } from "lucide-react";

export type BoardSwitcherHeaderProps = {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
};

/**
 * Search row + toolbar actions (list / pin use default button styling; no behavior yet).
 */
export function BoardSwitcherHeader({
  searchQuery,
  onSearchChange,
}: BoardSwitcherHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-white/10 border-b px-4 py-3">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/80"
          strokeWidth={2}
        />
        <Input
          aria-label="Search your boards"
          autoFocus
          className={cn(
            "h-10 w-full min-w-0 rounded-lg border border-white/15 bg-white/5 py-2 pr-3 pl-9 text-sm text-white shadow-none",
            "placeholder:text-white/45",
            "focus-visible:border-[#8AB4F8] focus-visible:ring-2 focus-visible:ring-[#8AB4F8]/35"
          )}
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
          placeholder="Search your boards"
          type="search"
          value={searchQuery}
        />
      </div>
      <Button
        aria-label="Board list layout"
        className="size-9 shrink-0 rounded-lg"
        size="icon"
        type="button"
        variant="default"
      >
        <List aria-hidden className="size-4" />
      </Button>
      <Button
        aria-label="Pin boards"
        className="size-9 shrink-0 rounded-lg"
        size="icon"
        type="button"
        variant="default"
      >
        <Pin aria-hidden className="size-4" />
      </Button>
    </div>
  );
}

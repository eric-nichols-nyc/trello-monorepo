"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { MessageSquare, Plug, Zap } from "lucide-react";

export type CardBackFooterProps = {
  commentsPanelOpen: boolean;
  onToggleCommentsPanel: () => void;
};

export function CardBackFooter({
  commentsPanelOpen,
  onToggleCommentsPanel,
}: CardBackFooterProps) {
  return (
    <div className="flex items-center justify-center gap-1 border-zinc-800 border-t px-4 py-3">
      <Button
        className="gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        size="sm"
        type="button"
        variant="ghost"
      >
        <Plug className="size-4" />
        Power-ups
      </Button>
      <div className="h-4 w-px bg-zinc-700" />
      <Button
        className="gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        size="sm"
        type="button"
        variant="ghost"
      >
        <Zap className="size-4" />
        Automations
      </Button>
      <div className="h-4 w-px bg-zinc-700" />
      <Button
        aria-pressed={commentsPanelOpen}
        className={cn(
          "gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
          commentsPanelOpen &&
            "bg-(--app-blue-accent)/20 text-(--app-blue-accent) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--app-blue-accent)_40%,transparent)] hover:bg-(--app-blue-accent)/30 hover:text-white",
        )}
        onClick={onToggleCommentsPanel}
        size="sm"
        type="button"
        variant="ghost"
      >
        <MessageSquare className="size-4" />
        Comments
      </Button>
    </div>
  );
}

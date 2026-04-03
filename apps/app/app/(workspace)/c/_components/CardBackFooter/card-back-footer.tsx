"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { MessageSquare, Plug, Zap } from "lucide-react";

export function CardBackFooter() {
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
        className="gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
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

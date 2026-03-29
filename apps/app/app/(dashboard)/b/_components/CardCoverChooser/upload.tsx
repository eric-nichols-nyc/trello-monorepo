"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";

/** Upload a custom image for the card cover. Wire `type="file"` / API later. */
export function Upload() {
  return (
    <Button
      className={cn(
        "w-full border border-zinc-500/70 bg-zinc-700 text-zinc-100 shadow-sm",
        "hover:border-zinc-400 hover:bg-zinc-600 hover:text-white",
        "focus-visible:border-sky-400 focus-visible:ring-sky-400/40",
      )}
      type="button"
      variant="secondary"
    >
      Upload a cover image
    </Button>
  );
}

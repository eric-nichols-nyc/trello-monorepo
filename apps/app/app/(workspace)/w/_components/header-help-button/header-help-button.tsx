"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { CircleHelp } from "lucide-react";

type HeaderHelpButtonProps = {
  readonly className?: string;
};

export function HeaderHelpButton({ className }: HeaderHelpButtonProps) {
  return (
    <Button
      aria-label="Help"
      className={cn("relative text-muted-foreground", className)}
      size="icon"
      type="button"
      variant="ghost"
    >
      <CircleHelp aria-hidden className="size-5" strokeWidth={2} />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1.5 right-1.5 size-2 rounded-full bg-violet-500 ring-2 ring-background"
      />
    </Button>
  );
}

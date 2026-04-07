"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

export type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  readonly Icon: LucideIcon;
};

/** Small list-card metadata glyph; pass any Lucide icon via {@link BadgeProps.Icon}. */
export function Badge({ Icon, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center text-zinc-400",
        className
      )}
      {...props}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2} />
    </span>
  );
}

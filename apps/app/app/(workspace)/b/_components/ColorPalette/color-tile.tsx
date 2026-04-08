"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { ComponentProps } from "react";

export type ColorTileProps = Omit<ComponentProps<"button">, "type"> & {
  readonly color: string;
  readonly label: string;
  readonly selected?: boolean;
};

export function ColorTile({
  color,
  label,
  selected = false,
  className,
  style: styleProp,
  ...props
}: ColorTileProps) {
  return (
    <button
      {...props}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "aspect-3/2 w-full min-h-0 shrink-0 rounded-xl border-2 shadow-sm",
        "focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80",
        "disabled:pointer-events-none disabled:opacity-50",
        selected === true
          ? "border-white ring-2 ring-white"
          : "border-transparent",
        className
      )}
      style={{ ...styleProp, backgroundColor: color }}
      type="button"
    />
  );
}

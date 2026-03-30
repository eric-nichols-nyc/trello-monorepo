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
        "size-8 shrink-0 rounded-md border-2 shadow-sm transition-transform hover:scale-105",
        "focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80",
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

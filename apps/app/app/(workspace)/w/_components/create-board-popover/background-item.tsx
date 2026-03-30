"use client";

import { cn } from "@repo/design-system/lib/utils";
import { Check } from "lucide-react";
import type { CSSProperties, KeyboardEvent, ReactNode, Ref } from "react";

export type BackgroundItemProps = {
  readonly ref?: Ref<HTMLButtonElement | null>;
  readonly title: string;
  readonly color?: string;
  readonly image?: string;
  readonly selected?: boolean;
  readonly isPhoto?: boolean;
  readonly isMenuToggle?: boolean;
  readonly onSelect: () => void;
  readonly children?: ReactNode;
  readonly className?: string;
};

function handleBackgroundItemKeyDown(
  onSelect: () => void,
  event: KeyboardEvent<HTMLButtonElement>
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

export function BackgroundItem({
  ref,
  title,
  color,
  image,
  selected = false,
  isPhoto = false,
  isMenuToggle = false,
  onSelect,
  children,
  className,
}: BackgroundItemProps) {
  const hasColor = color !== undefined && color.length > 0;
  const hasImage = image !== undefined && image.length > 0;

  const style: CSSProperties = {};
  if (hasColor) {
    style.backgroundColor = color;
  }
  if (hasImage) {
    style.backgroundImage = `url(${image})`;
  }

  const a11yProps = isMenuToggle
    ? ({ "aria-haspopup": true as const } as const)
    : ({ "aria-pressed": selected } as const);

  return (
    <li className={cn("list-none", className)}>
      <button
        {...a11yProps}
        className={cn(
          "relative h-10 w-full min-w-0 overflow-hidden rounded-md border-2 p-0 shadow-sm outline-none transition-transform",
          "hover:brightness-110 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          selected === true
            ? "border-white ring-2 ring-white"
            : "border-transparent",
          isPhoto === true ? "bg-center bg-cover" : ""
        )}
        onClick={onSelect}
        onKeyDown={(event) => handleBackgroundItemKeyDown(onSelect, event)}
        ref={ref}
        style={style}
        title={title}
        type="button"
      >
        {children}
        {selected === true ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-black/55">
              <Check className="size-3.5 text-white" strokeWidth={3} />
            </span>
          </span>
        ) : null}
      </button>
    </li>
  );
}

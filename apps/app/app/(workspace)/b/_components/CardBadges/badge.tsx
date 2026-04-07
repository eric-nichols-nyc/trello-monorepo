"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type BadgeProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children" | "title"
> & {
  readonly Icon: LucideIcon;
  /** Optional suffix (e.g. attachment / checklist counts). */
  readonly children?: ReactNode;
  /** Native tooltip on the badge (`title` on the root span). */
  readonly title?: string;
};

/** Small list-card metadata row: Lucide {@link BadgeProps.Icon} plus optional {@link BadgeProps.children}. */
export function Badge({
  Icon,
  className,
  children,
  title,
  ...props
}: BadgeProps) {
  const hasSuffix = children != null && children !== "";

  return (
    <span
      className={cn(
        "inline-flex h-4 shrink-0 items-center gap-0.5 text-zinc-400",
        hasSuffix
          ? "min-w-0 justify-start font-medium text-[10px] leading-none tabular-nums"
          : "size-4 justify-center",
        className
      )}
      title={title}
      {...props}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
      {children}
    </span>
  );
}

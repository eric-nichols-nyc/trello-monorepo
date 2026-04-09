"use client";

import { DropdownMenuTrigger } from "@repo/design-system/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";
import { cn } from "@repo/design-system/lib/utils";
import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

/** App tooltip chrome: light grey panel, no arrow (Radix arrow is a direct SVG child). */
const titleTooltipContentClass = cn(
  "border-0 shadow-sm",
  "rounded-sm bg-zinc-200 px-2.5 py-1.5 text-xs text-zinc-900",
  "dark:bg-zinc-600 dark:text-zinc-50",
  "[&>svg]:hidden"
);

export type TitleTooltipProps = {
  /** Text or node shown in the floating tooltip. */
  readonly title: ReactNode;
  /**
   * Hover/focus target. Prefer a single element (e.g. a {@link Button}) so
   * trigger props merge cleanly; plain text or fragments are wrapped in a span.
   */
  readonly children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof TooltipContent>, "children">;

export function TitleTooltip({
  title,
  children,
  className,
  ...contentProps
}: TitleTooltipProps) {
  const trigger = isValidElement(children) ? (
    children
  ) : (
    <span className="inline-flex">{children}</span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent
        {...contentProps}
        className={cn(titleTooltipContentClass, className)}
      >
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

export type TitleTooltipDropdownTriggerProps = {
  readonly title: ReactNode;
  readonly children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof TooltipContent>, "children">;

/**
 * Use inside {@link DropdownMenu} when the same control should show a tooltip and
 * open the menu (Radix requires {@link TooltipTrigger} → {@link DropdownMenuTrigger} → element).
 */
export function TitleTooltipDropdownTrigger({
  title,
  children,
  className,
  ...contentProps
}: TitleTooltipDropdownTriggerProps) {
  const trigger = isValidElement(children) ? (
    children
  ) : (
    <span className="inline-flex">{children}</span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent
        {...contentProps}
        className={cn(titleTooltipContentClass, className)}
      >
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

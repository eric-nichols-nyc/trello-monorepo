"use client";

import { DropdownMenuTrigger } from "@repo/design-system/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/design-system/components/ui/tooltip";
import { cn } from "@repo/design-system/lib/utils";
import {
  type ComponentPropsWithoutRef,
  isValidElement,
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

export type StarProjectTitleTooltipProps = {
  /** Board or project name shown in the tooltip copy. */
  readonly projectName: string;
  readonly isStarred: boolean;
  readonly children: TitleTooltipProps["children"];
} & Omit<TitleTooltipProps, "title" | "children">;

/**
 * Tooltip for star/unstar controls: explains what clicking does for this project/board.
 */
export function StarProjectTitleTooltip({
  projectName,
  isStarred,
  children,
  className,
  side = "bottom",
  ...contentProps
}: StarProjectTitleTooltipProps) {
  const title = isStarred
    ? `Click to unstar ${projectName}. It will be removed from your starred list.`
    : `Click to star ${projectName}. It will be added to your starred list.`;

  return (
    <TitleTooltip
      className={cn(
        "max-w-[200px] whitespace-normal wrap-break-word text-[10px] leading-snug",
        className
      )}
      side={side}
      title={title}
      {...contentProps}
    >
      {children}
    </TitleTooltip>
  );
}

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

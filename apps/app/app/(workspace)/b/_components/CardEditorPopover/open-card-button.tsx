"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import type { ComponentProps } from "react";

/** Same segment as {@link BoardLists} `cardPathSegments`: `shortLink` or card `id` when empty. */
export function cardPathSegmentForCard(card: {
  id: string;
  shortLink: string;
}): string {
  return card.shortLink.trim().length > 0 ? card.shortLink : card.id;
}

export type OpenCardButtonProps = Omit<
  ComponentProps<typeof Button>,
  "asChild" | "children" | "size" | "variant"
> & {
  /** `shortLink`, or card `id` when short link is missing — must match `/c/[shortlink]` routing. */
  cardPathSegment: string;
  /** @default "Open card" */
  label?: string;
};

export function OpenCardButton({
  className,
  cardPathSegment,
  label = "Open card",
  ...props
}: OpenCardButtonProps) {
  const trimmed = cardPathSegment.trim();
  const href =
    trimmed.length > 0 ? `/c/${encodeURIComponent(trimmed)}` : null;

  if (href === null) {
    return (
      <Button
        aria-label={label}
        className={className}
        disabled
        size="icon-sm"
        title={label}
        type="button"
        variant="ghost"
        {...props}
      >
        <SquareArrowOutUpRight aria-hidden className="size-4" strokeWidth={2} />
      </Button>
    );
  }

  return (
    <Button
      asChild
      aria-label={label}
      className={className}
      size="icon-sm"
      title={label}
      variant="ghost"
      {...props}
    >
      <a href={href}>
        <SquareArrowOutUpRight aria-hidden className="size-4" strokeWidth={2} />
      </a>
    </Button>
  );
}

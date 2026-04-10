"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import type { ComponentProps } from "react";

export type MoveButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** Reserved for move-card flow; not passed to the underlying button. */
  readonly boardKey?: string;
  readonly cardId?: string;
  /** @default "Move" */
  label?: string;
};

export function MoveButton({
  boardKey: _boardKey,
  cardId: _cardId,
  className,
  label = "Move",
  ...buttonProps
}: MoveButtonProps) {
  return (
    <Button
      aria-label={label}
      className={className}
      size="icon-sm"
      title={label}
      type="button"
      variant="ghost"
      {...buttonProps}
    >
      <ArrowRightLeft aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import type { ComponentProps } from "react";

export type OpenCardButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Open card" */
  label?: string;
};

export function OpenCardButton({
  className,
  label = "Open card",
  ...props
}: OpenCardButtonProps) {
  return (
    <Button
      aria-label={label}
      className={className}
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

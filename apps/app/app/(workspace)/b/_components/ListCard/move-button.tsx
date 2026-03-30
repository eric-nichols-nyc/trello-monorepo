"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ArrowRightLeft } from "lucide-react";
import type { ComponentProps } from "react";

export type MoveButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Move" */
  label?: string;
};

export function MoveButton({
  className,
  label = "Move",
  ...props
}: MoveButtonProps) {
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
      <ArrowRightLeft aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

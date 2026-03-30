"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Copy } from "lucide-react";
import type { ComponentProps } from "react";

export type CopyCardProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Copy card" */
  label?: string;
};

export function CopyCard({
  className,
  label = "Copy card",
  ...props
}: CopyCardProps) {
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
      <Copy aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ImagePlus } from "lucide-react";
import type { ComponentProps } from "react";

export type ChangeCoverButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Change cover" */
  label?: string;
};

export function ChangeCoverButton({
  className,
  label = "Change cover",
  ...props
}: ChangeCoverButtonProps) {
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
      <ImagePlus aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

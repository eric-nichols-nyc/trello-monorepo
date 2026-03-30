"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Trash2 } from "lucide-react";
import type { ComponentProps } from "react";

export type DeleteCardButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Delete card" */
  label?: string;
};

export function DeleteCardButton({
  className,
  label = "Delete card",
  ...props
}: DeleteCardButtonProps) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        className
      )}
      size="icon-sm"
      title={label}
      type="button"
      variant="ghost"
      {...props}
    >
      <Trash2 aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

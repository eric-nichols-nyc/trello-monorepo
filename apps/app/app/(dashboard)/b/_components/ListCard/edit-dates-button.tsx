"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { CalendarClock } from "lucide-react";
import type { ComponentProps } from "react";

export type EditDatesButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Edit dates" */
  label?: string;
};

export function EditDatesButton({
  className,
  label = "Edit dates",
  ...props
}: EditDatesButtonProps) {
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
      <CalendarClock aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

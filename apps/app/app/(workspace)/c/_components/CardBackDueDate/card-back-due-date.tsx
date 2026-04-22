"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ChevronDown } from "lucide-react";
import { formatCardDateTime } from "@/lib/datetime/format-card-date-time";

export type CardBackDueDateProps = {
  dueDate: string | null;
};

function formatDueLabel(iso: string | null): string | null {
  if (iso === null) {
    return null;
  }
  return formatCardDateTime(iso);
}

function dueSoonLabel(dueIso: string | null): string | null {
  if (dueIso === null) {
    return null;
  }
  const due = new Date(dueIso).getTime();
  if (Number.isNaN(due)) {
    return null;
  }
  const now = Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  if (due > now && due - now < twoDays) {
    return "Due soon";
  }
  if (due < now) {
    return "Overdue";
  }
  return null;
}

export function CardBackDueDate({ dueDate }: CardBackDueDateProps) {
  const dueLabel = formatDueLabel(dueDate);
  const dueBadge = dueSoonLabel(dueDate);

  if (dueLabel === null) {
    return null;
  }

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm text-zinc-400">Due date</p>
      <Button
        className="gap-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
        type="button"
        variant="ghost"
      >
        {dueLabel}
        {dueBadge !== null ? (
          <Badge
            className={cn(
              "border-0 hover:bg-yellow-500",
              dueBadge === "Overdue"
                ? "bg-red-500 text-red-950 hover:bg-red-500"
                : "bg-yellow-500 text-yellow-950"
            )}
          >
            {dueBadge}
          </Badge>
        ) : null}
        <ChevronDown className="size-4" />
      </Button>
    </div>
  );
}

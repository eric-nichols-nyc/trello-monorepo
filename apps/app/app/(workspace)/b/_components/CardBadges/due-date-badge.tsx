"use client";

import { Clock } from "lucide-react";

import { cn } from "@repo/design-system/lib/utils";

import { Badge } from "./badge";

export type DueDateBadgeProps = {
  startDate?: Date;
  dueDate?: Date;
  dueComplete?: boolean;
};

/** e.g. `Apr 11` in the user locale. */
function formatDueDayMonth(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function dueTooltip({
  startDate,
  dueDate,
  dueComplete,
}: DueDateBadgeProps): string {
  const parts: string[] = [];
  if (startDate !== undefined) {
    parts.push(`Starts ${startDate.toLocaleString()}`);
  }
  if (dueDate !== undefined) {
    parts.push(`Due ${dueDate.toLocaleString()}`);
  }
  if (dueComplete === true) {
    parts.push("Complete");
  }
  return parts.join(" · ");
}

export function DueDateBadge({
  startDate,
  dueDate,
  dueComplete,
}: DueDateBadgeProps) {
  if (dueDate === undefined) {
    return null;
  }

  return (
    <Badge
      Icon={Clock}
      aria-label={dueTooltip({ startDate, dueDate, dueComplete })}
      className={cn(dueComplete === true && "text-emerald-400")}
      title={dueTooltip({ startDate, dueDate, dueComplete })}
    >
      {formatDueDayMonth(dueDate)}
    </Badge>
  );
}

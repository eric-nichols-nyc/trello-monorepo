"use client";

import { Clock } from "lucide-react";

import { cn } from "@repo/design-system/lib/utils";

import { Badge } from "./badge";

export interface DueDateBadgeProps {
  startDate?: Date;
  dueDate?: Date;
  dueComplete?: boolean;
}

function dueTooltip({
  startDate,
  dueDate,
  dueComplete,
}: DueDateBadgeProps): string {
  const parts: string[] = [];
  if (startDate != null) {
    parts.push(`Starts ${startDate.toLocaleString()}`);
  }
  if (dueDate != null) {
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
  if (dueDate == null) {
    return null;
  }

  return (
    <Badge
      Icon={Clock}
      aria-label={dueTooltip({ startDate, dueDate, dueComplete })}
      className={cn(dueComplete === true && "text-emerald-400")}
      title={dueTooltip({ startDate, dueDate, dueComplete })}
    />
  );
}

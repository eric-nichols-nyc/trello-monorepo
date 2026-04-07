"use client";

import { CheckSquare } from "lucide-react";

import { Badge } from "./badge";

export interface ChecklistsBadgeProps {
  total: number | undefined;
  completed: number | undefined;
  due: string | null | undefined;
}

function checklistTooltip(
  ratio: string,
  due: string | null | undefined
): string {
  if (due == null || String(due).trim() === "") {
    return `Checklist ${ratio}`;
  }
  return `Checklist ${ratio} · Due ${String(due)}`;
}

export function ChecklistBadge({
  total,
  completed,
  due,
}: ChecklistsBadgeProps) {
  if (total == null || typeof total !== "number" || total < 1) {
    return null;
  }

  const done =
    typeof completed === "number" && completed >= 0
      ? Math.min(completed, total)
      : 0;
  const ratio = `${done}/${total}`;
  const tip = checklistTooltip(ratio, due);

  return (
    <Badge Icon={CheckSquare} aria-label={tip} title={tip}>
      {ratio}
    </Badge>
  );
}

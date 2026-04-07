"use client";

import { AlignLeft } from "lucide-react";

import { Badge } from "./badge";

export type DescriptionBadgeProps = {
  /** Card description body; badge is hidden when `null`, missing, or blank. */
  description?: string | null;
};

export function DescriptionBadge({ description }: DescriptionBadgeProps) {
  if (description == null) {
    return null;
  }

  const trimmed = description.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return (
    <Badge
      Icon={AlignLeft}
      aria-label={trimmed}
      title={trimmed}
    />
  );
}

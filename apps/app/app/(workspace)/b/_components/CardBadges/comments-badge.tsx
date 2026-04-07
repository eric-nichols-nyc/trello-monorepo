"use client";

import { MessageSquareText } from "lucide-react";

import { Badge } from "./badge";

export type CommentsBadgeProps = {
  count: number;
};

export function CommentsBadge({ count }: CommentsBadgeProps) {
  if (typeof count !== "number" || count < 1) {
    return null;
  }

  const label =
    count === 1 ? "1 comment" : `${count} comments`;

  return (
    <Badge Icon={MessageSquareText} aria-label={label} title={label}>
      {count}
    </Badge>
  );
}

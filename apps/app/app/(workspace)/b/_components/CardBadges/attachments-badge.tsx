"use client";

import { Paperclip } from "lucide-react";

import { Badge } from "./badge";

export type AttachmentsBadgeProps = {
  count: number;
};

export function AttachmentsBadge({ count }: AttachmentsBadgeProps) {
  if (typeof count !== "number" || count < 1) {
    return null;
  }

  return <Badge Icon={Paperclip}>{count}</Badge>;
}

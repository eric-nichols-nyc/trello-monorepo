"use client";

import { AttachmentsBadge } from "./attachments-badge";
import { ChecklistBadge } from "./checklist-badge";
import { CommentsBadge } from "./comments-badge";
import { DescriptionBadge } from "./description-badge";
import { DueDateBadge } from "./due-date-badge";

export type CardBadgesProps = {
  /** Card description — drives {@link DescriptionBadge} visibility. */
  description?: string | null;
  /** Attachment count — drives {@link AttachmentsBadge} visibility. */
  attachmentCount?: number;
};

/** Row of metadata badges below the card title (dates, attachments, etc.). */
export function CardBadges({
  description,
  attachmentCount = 0,
}: CardBadgesProps) {
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1">
      <DueDateBadge />
      <DescriptionBadge description={description} />
      <AttachmentsBadge count={attachmentCount} />
      <CommentsBadge />
      <ChecklistBadge />
    </div>
  );
}

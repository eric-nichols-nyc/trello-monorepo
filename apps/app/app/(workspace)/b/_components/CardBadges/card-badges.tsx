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
  /** Comment count — drives {@link CommentsBadge} visibility. */
  commentCount?: number;
  /** Due / start — drives {@link DueDateBadge} (`dueDate` required for visibility). */
  dueDate?: Date;
  startDate?: Date;
  dueComplete?: boolean;
  /** Checklist progress — drives {@link ChecklistBadge} (`total` required for visibility). */
  checklistTotal?: number;
  checklistCompleted?: number;
  checklistDue?: string | null;
};

/** Row of metadata badges below the card title (dates, attachments, etc.). */
export function CardBadges({
  description,
  attachmentCount = 0,
  commentCount = 0,
  dueDate,
  startDate,
  dueComplete,
  checklistTotal,
  checklistCompleted,
  checklistDue,
}: CardBadgesProps) {
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1">
      <DueDateBadge
        dueComplete={dueComplete}
        dueDate={dueDate}
        startDate={startDate}
      />
      <DescriptionBadge description={description} />
      <AttachmentsBadge count={attachmentCount} />
      <CommentsBadge count={commentCount} />
      <ChecklistBadge
        completed={checklistCompleted}
        due={checklistDue}
        total={checklistTotal}
      />
    </div>
  );
}

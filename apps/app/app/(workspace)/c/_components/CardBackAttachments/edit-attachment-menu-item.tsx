"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";

import type { BoardAttachment } from "@/types/board-detail";

export type EditAttachmentMenuItemProps = {
  attachment: BoardAttachment;
  onEdit?: (attachment: BoardAttachment) => void;
};

export function EditAttachmentMenuItem({
  attachment,
  onEdit,
}: EditAttachmentMenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={() => {
        if (onEdit) {
          onEdit(attachment);
          return;
        }
        window.open(attachment.url, "_blank", "noopener,noreferrer");
      }}
    >
      Edit
    </DropdownMenuItem>
  );
}

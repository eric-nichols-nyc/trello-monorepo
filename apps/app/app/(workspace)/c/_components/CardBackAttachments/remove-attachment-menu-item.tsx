"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";

import { toast } from "@/lib/toast";
import type { BoardAttachment } from "@/types/board-detail";

export type RemoveAttachmentMenuItemProps = {
  attachment: BoardAttachment;
  onRemove?: (attachment: BoardAttachment) => void;
};

export function RemoveAttachmentMenuItem({
  attachment,
  onRemove,
}: RemoveAttachmentMenuItemProps) {
  return (
    <DropdownMenuItem
      className="text-red-400 focus:text-red-300"
      onClick={() => {
        if (onRemove) {
          onRemove(attachment);
          return;
        }
        toast.error("Remove attachment is not available yet");
      }}
    >
      Remove
    </DropdownMenuItem>
  );
}

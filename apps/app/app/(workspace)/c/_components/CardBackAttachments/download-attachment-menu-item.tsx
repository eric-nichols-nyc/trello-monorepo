"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";

import type { BoardAttachment } from "@/types/board-detail";

export type DownloadAttachmentMenuItemProps = {
  attachment: BoardAttachment;
};

export function DownloadAttachmentMenuItem({
  attachment,
}: DownloadAttachmentMenuItemProps) {
  return (
    <DropdownMenuItem asChild>
      <a download href={attachment.url} rel="noreferrer" target="_blank">
        Download
      </a>
    </DropdownMenuItem>
  );
}

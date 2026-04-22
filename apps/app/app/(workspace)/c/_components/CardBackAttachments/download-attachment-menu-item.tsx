"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";

import { cloudinaryForcedDownloadUrl } from "@/lib/cloudinary-forced-download-url";
import type { BoardAttachment } from "@/types/board-detail";

export type DownloadAttachmentMenuItemProps = {
  attachment: BoardAttachment;
};

export function DownloadAttachmentMenuItem({
  attachment,
}: DownloadAttachmentMenuItemProps) {
  const href = cloudinaryForcedDownloadUrl(attachment.url, attachment.name);

  return (
    <DropdownMenuItem asChild>
      <a download={attachment.name || undefined} href={href} rel="noreferrer" target="_blank">
        Download
      </a>
    </DropdownMenuItem>
  );
}

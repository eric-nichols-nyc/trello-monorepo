"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import type { BoardAttachment } from "@/types/board-detail";
import { DownloadAttachmentMenuItem } from "./download-attachment-menu-item";
import { EditAttachmentMenuItem } from "./edit-attachment-menu-item";
import { RemoveAttachmentMenuItem } from "./remove-attachment-menu-item";

export type CardBackAttachmentActionsProps = {
  attachment: BoardAttachment;
  onEdit?: (attachment: BoardAttachment) => void;
  onRemove?: (attachment: BoardAttachment) => void;
};

export function CardBackAttachmentActions({
  attachment,
  onEdit,
  onRemove,
}: CardBackAttachmentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-zinc-700 bg-zinc-800 text-zinc-100"
      >
        <EditAttachmentMenuItem
          attachment={attachment}
          onEdit={onEdit}
        />
        <DownloadAttachmentMenuItem attachment={attachment} />
        <RemoveAttachmentMenuItem
          attachment={attachment}
          onRemove={onRemove}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

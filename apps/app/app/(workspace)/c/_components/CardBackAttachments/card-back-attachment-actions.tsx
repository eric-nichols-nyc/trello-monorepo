"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

import { toast } from "@/lib/toast";
import type { BoardAttachment } from "@/types/board-detail";

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
        <DropdownMenuItem asChild>
          <a download href={attachment.url} rel="noreferrer" target="_blank">
            Download
          </a>
        </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

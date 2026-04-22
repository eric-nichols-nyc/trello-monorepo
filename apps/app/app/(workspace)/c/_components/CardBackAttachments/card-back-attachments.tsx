"use client";

import { Paperclip } from "lucide-react";

import type { BoardAttachment } from "@/types/board-detail";
import { FileAttachment } from "./file-attachment";

export type CardBackAttachmentsProps = {
  attachments: BoardAttachment[];
};

export function CardBackAttachments({ attachments }: CardBackAttachmentsProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip className="size-4" />
        <h2 className="font-medium text-sm">Attachments</h2>
      </div>

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <FileAttachment
            attachment={attachment}
            key={attachment.id}
          />
        ))}
      </div>
    </section>
  );
}

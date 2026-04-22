"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ExternalLink, FileText, Globe } from "lucide-react";

import { formatCardDateTime } from "@/lib/datetime/format-card-date-time";
import type { BoardAttachment } from "@/types/board-detail";
import { CardBackAttachmentActions } from "./card-back-attachment-actions";

function isImageAttachment(attachment: BoardAttachment): boolean {
  return attachment.mimeType?.startsWith("image/") === true;
}

export type FileAttachmentProps = {
  attachment: BoardAttachment;
};

export function FileAttachment({ attachment }: FileAttachmentProps) {
  return (
    <div className="group flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-2">
      <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-800">
        {isImageAttachment(attachment) ? (
          <img
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            src={attachment.url}
          />
        ) : attachment.isUpload ? (
          <FileText className="size-4 text-zinc-400" />
        ) : (
          <Globe className="size-4 text-zinc-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-sm text-zinc-200">{attachment.name}</p>
        <p className="text-[12px] text-zinc-500">
          Added {formatCardDateTime(attachment.createdAt) ?? "recently"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          asChild
          className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          size="icon"
          variant="ghost"
        >
          <a
            aria-label={`Open ${attachment.name}`}
            href={attachment.url}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
          </a>
        </Button>

        <CardBackAttachmentActions attachment={attachment} />
      </div>
    </div>
  );
}

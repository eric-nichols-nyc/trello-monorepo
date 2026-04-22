"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { ExternalLink, FileText, Globe, MoreHorizontal, Paperclip } from "lucide-react";

import type { BoardAttachment } from "@/types/board-detail";

function isImageAttachment(attachment: BoardAttachment): boolean {
  return attachment.mimeType?.startsWith("image/") === true;
}

function formatAttachmentTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) {
    return "recently";
  }
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: timestamp < Date.now() - 365 * 24 * 60 * 60 * 1000 ? "numeric" : undefined,
  });
}

export type CardBackAttachmentsProps = {
  attachments: BoardAttachment[];
};

export function CardBackAttachments({ attachments }: CardBackAttachmentsProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2 text-zinc-300">
        <Paperclip className="size-4" />
        <h2 className="font-medium text-sm">Attachments</h2>
      </div>

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            className="group flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-2"
            key={attachment.id}
          >
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
              <p className="truncate text-sm text-zinc-200">{attachment.name}</p>
              <p className="text-xs text-zinc-500">Added {formatAttachmentTime(attachment.createdAt)}</p>
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
                <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-800 text-zinc-100">
                  <DropdownMenuItem asChild>
                    <a href={attachment.url} rel="noreferrer" target="_blank">
                      Open
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

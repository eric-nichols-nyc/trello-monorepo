"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ExternalLink } from "lucide-react";

export type OpenAttachmentExternalLinkButtonProps = {
  href: string;
  fileName: string;
};

/** Opens the attachment URL in a new browser tab. */
export function OpenAttachmentExternalLinkButton({
  href,
  fileName,
}: OpenAttachmentExternalLinkButtonProps) {
  return (
    <Button
      asChild
      className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
      size="icon"
      variant="ghost"
    >
      <a
        aria-label={`Open ${fileName} in a new tab`}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLink className="size-4" />
      </a>
    </Button>
  );
}

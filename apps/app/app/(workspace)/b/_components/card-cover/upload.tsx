"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { useRef } from "react";

import { useUploadCardCover } from "@/queries/use-upload-card-cover";

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp";

export type UploadProps = {
  readonly boardKey: string;
  readonly cardId: string;
  readonly onApplied?: () => void;
};

export function Upload({ boardKey, cardId, onApplied }: UploadProps) {
  const inputReference = useRef<HTMLInputElement>(null);
  const mutation = useUploadCardCover({
    boardKey,
    cardId,
    onSuccess: onApplied,
  });

  return (
    <div className="space-y-2">
      <input
        accept={ACCEPT}
        aria-label="Choose cover image file"
        className="sr-only"
        disabled={mutation.isPending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            mutation.mutate(file);
          }
        }}
        ref={inputReference}
        type="file"
      />
      <Button
        aria-busy={mutation.isPending}
        className={cn(
          "w-full border border-zinc-500/70 bg-zinc-700 text-zinc-100 shadow-sm",
          "hover:border-zinc-400 hover:bg-zinc-600 hover:text-white",
          "focus-visible:border-sky-400 focus-visible:ring-sky-400/40",
        )}
        disabled={mutation.isPending}
        onClick={() => inputReference.current?.click()}
        type="button"
        variant="secondary"
      >
        {mutation.isPending ? "Uploading…" : "Upload a cover image"}
      </Button>
    </div>
  );
}

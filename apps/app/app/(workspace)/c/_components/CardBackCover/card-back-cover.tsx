"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowLeft, Image as ImageIcon, MoreHorizontal, X } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";

import { MoveCardPopover } from "../MoveCardPopover/move-card-popover";

const chromeIconButtonClass =
  "h-10 w-10 shrink-0 rounded-lg bg-[#2a2d35] text-white/70 hover:bg-[#3a3d45] hover:text-white";

export type CardBackCoverProps = {
  boardLists: CardRouteBoardList[];
  boardName: string;
  coverColor: string | null;
  coverImage: string | null;
  currentListId: string;
  listName: string;
  mode: "modal" | "page";
  backHref: string;
  onRequestClose: () => void;
};

export function CardBackCover({
  boardLists,
  boardName,
  coverColor,
  coverImage,
  currentListId,
  listName,
  mode,
  backHref,
  onRequestClose,
}: CardBackCoverProps) {
  const hasImage = coverImage !== null && String(coverImage).trim().length > 0;
  const hasColor = coverColor !== null && String(coverColor).trim().length > 0;
  const resolvedCoverImage = hasImage ? String(coverImage).trim() : null;

  let fillStyle: CSSProperties | undefined;
  if (!hasImage && hasColor) {
    fillStyle = { backgroundColor: String(coverColor) };
  }

  const showCoverMedia = hasImage || hasColor;

  return (
    <div className="rounded-t-xl border-zinc-800 border-b bg-[#1a1d24] p-4 text-white">
      <div className="flex items-center justify-between gap-4">
        <MoveCardPopover
          boardLists={boardLists}
          boardName={boardName}
          currentListId={currentListId}
          listName={listName}
          variant="cover"
        />

        <div className="flex shrink-0 items-center gap-4">
          <Button
            className={`${chromeIconButtonClass} size-4`}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ImageIcon className="size-4" />
          </Button>
          <Button
                className={`${chromeIconButtonClass} size-4`}
                size="icon"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal className="size-5" />
          </Button>
          {mode === "modal" ? (
            <Button
              aria-label="Close card"
              className={`${chromeIconButtonClass} size-4`}
              onClick={onRequestClose}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          ) : (
            <Button
              asChild
                className={`${chromeIconButtonClass} size-4`}
              size="icon"
              variant="ghost"
            >
              <Link aria-label="Back to board" href={backHref}>
                <X className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {showCoverMedia ? (
        <div className="mt-4 flex justify-center">
          <div
            className={cn(
              "h-[160px] w-full max-w-[400px] overflow-hidden rounded-lg",
              hasImage ? "relative" : "bg-zinc-800/50"
            )}
          >
            {resolvedCoverImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote card cover URLs from API
              <NextImage
                alt=""
                className="size-full object-cover object-bottom"
                fill
                src={resolvedCoverImage}
              />
            ) : (
              <div aria-hidden className="size-full" style={fillStyle} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

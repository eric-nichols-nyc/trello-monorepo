"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import type { CSSProperties } from "react";
import { ArrowLeft, Image, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";

import { CardBackActionsMenu } from "../CardBackActionsMenu/card-back-actions-menu";

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
  const hasImage =
    coverImage != null && String(coverImage).trim().length > 0;
  const hasColor =
    coverColor != null && String(coverColor).trim().length > 0;

  const fillStyle: CSSProperties | undefined =
    hasImage === true
      ? undefined
      : hasColor === true
        ? { backgroundColor: String(coverColor) }
        : undefined;

  const showCoverMedia = hasImage || hasColor;

  return (
    <div className="rounded-t-xl border-zinc-800 border-b bg-[#1a1d24] p-4 text-white">
      <div className="flex items-center justify-between gap-4">
        <CardBackActionsMenu
          boardLists={boardLists}
          boardName={boardName}
          currentListId={currentListId}
          listName={listName}
          variant="cover"
        />

        <div className="flex shrink-0 items-center gap-1">
          <Button
            className={chromeIconButtonClass}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Image className="size-5" />
          </Button>
          <Button
            className={chromeIconButtonClass}
            size="icon"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal className="size-5" />
          </Button>
          {mode === "modal" ? (
            <Button
              aria-label="Close card"
              className={chromeIconButtonClass}
              onClick={onRequestClose}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="size-5" />
            </Button>
          ) : (
            <Button
              asChild
              className={chromeIconButtonClass}
              size="icon"
              variant="ghost"
            >
              <Link aria-label="Back to board" href={backHref}>
                <ArrowLeft className="size-5" />
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
              hasImage ? "relative" : "bg-zinc-800/50",
            )}
          >
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote card cover URLs from API
              <img
                alt=""
                className="size-full object-cover object-bottom"
                src={coverImage!}
              />
            ) : (
              <div
                aria-hidden
                className="size-full"
                style={fillStyle}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

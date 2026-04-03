"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ArrowLeft, Image, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";

import { CardBackActionsMenu } from "../CardBackActionsMenu/card-back-actions-menu";

export type CardBackHeaderProps = {
  boardLists: CardRouteBoardList[];
  boardName: string;
  currentListId: string;
  listName: string;
  mode: "modal" | "page";
  backHref: string;
  onRequestClose: () => void;
};

export function CardBackHeader({
  boardLists,
  boardName,
  currentListId,
  listName,
  mode,
  backHref,
  onRequestClose,
}: CardBackHeaderProps) {
  return (
    <div className="flex items-center justify-between border-zinc-800 border-b px-4 py-3">
      <CardBackActionsMenu
        boardLists={boardLists}
        boardName={boardName}
        currentListId={currentListId}
        listName={listName}
      />
      <div className="flex items-center gap-2">
        <Button
          className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Image className="size-5" />
        </Button>
        <Button
          className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal className="size-5" />
        </Button>
        {mode === "modal" ? (
          <Button
            aria-label="Close card"
            className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            onClick={onRequestClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        ) : (
          <Button
            asChild
            className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            size="icon-sm"
            variant="ghost"
          >
            <Link aria-label="Back to board" href={backHref}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

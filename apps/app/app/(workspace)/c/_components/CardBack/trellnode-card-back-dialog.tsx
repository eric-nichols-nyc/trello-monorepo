"use client";

import {
  Dialog,
  DialogContent,
} from "@repo/design-system/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";
import type { BoardCard } from "@/types/board-detail";

import { CardBackPanel } from "../CardBackPanel/card-back-panel";

type CardRouteDetailProps = {
  boardLists: CardRouteBoardList[];
  boardName: string;
  boardRouteKey: string;
  card: BoardCard;
  listName: string;
  mode: "modal" | "page";
};

export function TrellnodeCardBackDialog({
  boardLists,
  boardName,
  boardRouteKey,
  card,
  listName,
  mode,
}: CardRouteDetailProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (mode === "modal") {
    return (
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          }
        }}
        open
      >
        <DialogContent
          className="top-[50px] max-h-[calc(100vh-50px-1rem)] w-full max-w-2xl translate-x-[-50%] translate-y-0 gap-0 overflow-y-auto border-zinc-800 bg-transparent p-0 text-zinc-100 shadow-none sm:max-w-2xl lg:max-w-5xl"
          showCloseButton={false}
        >
          <CardBackPanel
            boardLists={boardLists}
            boardName={boardName}
            boardRouteKey={boardRouteKey}
            card={card}
            listName={listName}
            mode="modal"
            onRequestClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 lg:max-w-5xl">
        <Link
          className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
          href={`/b/${encodeURIComponent(boardRouteKey)}`}
        >
          ← Back to board
        </Link>
        <CardBackPanel
          boardLists={boardLists}
          boardName={boardName}
          boardRouteKey={boardRouteKey}
          card={card}
          listName={listName}
          mode="page"
          onRequestClose={handleClose}
        />
      </div>
    </div>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
} from "@repo/design-system/components/ui/dialog";
import { cn } from "@repo/design-system/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);

  useEffect(() => {
    setCommentsPanelOpen(false);
  }, [card.id]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const cardShellMaxWidthClass = commentsPanelOpen
    ? "max-w-[min(100%,992px)]"
    : "max-w-[min(100%,585px)]";

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
          className={cn(
            "top-[50px] max-h-[calc(100vh-50px-1rem)] w-full translate-x-[-50%] translate-y-0 gap-0 overflow-y-auto border-zinc-800 bg-transparent p-0 text-zinc-100 shadow-none",
            cardShellMaxWidthClass,
          )}
          showCloseButton={false}
        >
          <CardBackPanel
            boardLists={boardLists}
            boardName={boardName}
            boardRouteKey={boardRouteKey}
            card={card}
            commentsPanelOpen={commentsPanelOpen}
            listName={listName}
            mode="modal"
            onCommentsPanelOpenChange={setCommentsPanelOpen}
            onRequestClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-4 px-4 py-8",
          cardShellMaxWidthClass,
        )}
      >
        <CardBackPanel
          boardLists={boardLists}
          boardName={boardName}
          boardRouteKey={boardRouteKey}
          card={card}
          commentsPanelOpen={commentsPanelOpen}
          listName={listName}
          mode="page"
          onCommentsPanelOpenChange={setCommentsPanelOpen}
          onRequestClose={handleClose}
        />
      </div>
    </div>
  );
}

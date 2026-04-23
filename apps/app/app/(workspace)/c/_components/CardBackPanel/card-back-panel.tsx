"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";
import type { BoardCard } from "@/types/board-detail";

import { CardBackAttachments } from "../CardBackAttachments/card-back-attachments";
import { CardBackChecklist } from "../CardBackChecklist/card-back-checklist";
import { CardBackCover } from "../CardBackCover/card-back-cover";
import { CardBackDescription } from "../CardBackDescription/card-back-description";
import { CardBackDueDate } from "../CardBackDueDate/card-back-due-date";
import { CardBackFooter } from "../CardBackFooter/card-back-footer";
import { CardBackQuickAdd } from "../CardBackQuickAdd/card-back-quickadd";
import { CardBackTitle } from "../CardBackTitle/card-back-title";

const CardBackCommentsLazy = lazy(async () => {
  const m = await import("../Comments/card-back-comments");
  return { default: m.CardBackComments };
});

export type CardBackPanelProps = {
  boardLists: CardRouteBoardList[];
  boardName: string;
  boardRouteKey: string;
  card: BoardCard;
  listName: string;
  mode: "modal" | "page";
  onRequestClose: () => void;
  /** When false, comments are collapsed and the shell is narrower (~585px on large viewports). */
  commentsPanelOpen: boolean;
  onCommentsPanelOpenChange: (open: boolean) => void;
};

export function CardBackPanel({
  boardLists,
  boardName,
  boardRouteKey,
  card,
  listName,
  mode,
  onRequestClose,
  commentsPanelOpen,
  onCommentsPanelOpenChange,
}: CardBackPanelProps) {
  const backHref = `/b/${encodeURIComponent(boardRouteKey)}`;
  const commentsPanelClassName =
    "max-h-[min(40vh,360px)] shrink-0 border-zinc-800 border-t lg:max-h-none lg:w-[min(100%,460px)] lg:border-t-0 lg:border-l";

  const [description, setDescription] = useState(card.description ?? "");
  const [completed, setCompleted] = useState(card.completed);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDescription(card.description ?? "");
  }, [card.id, card.updatedAt]);

  useEffect(() => {
    setCompleted(card.completed);
  }, [card.id, card.updatedAt, card.completed]);

  useEffect(() => {
    if (!commentsPanelOpen) {
      return;
    }
    const raf = window.requestAnimationFrame(() => {
      const width = panelRef.current?.getBoundingClientRect().width;
      if (typeof width === "number") {
        console.log("CardBackPanel width:", width);
      }
    });
    return () => window.cancelAnimationFrame(raf);
  }, [commentsPanelOpen]);

  return (
    <div
      className="w-full overflow-hidden rounded-xl bg-zinc-900 shadow-2xl"
      ref={panelRef}
    >
      <CardBackCover
        backHref={backHref}
        boardLists={boardLists}
        boardName={boardName}
        coverColor={card.coverColor}
        coverImage={card.coverImage}
        currentListId={card.listId}
        listName={listName}
        mode={mode}
        onRequestClose={onRequestClose}
      />

      <div className="flex max-h-[min(70vh,720px)] min-h-0 flex-col lg:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:min-w-0">
          <CardBackTitle
            boardRouteKey={boardRouteKey}
            cardId={card.id}
            completed={completed}
            mode={mode}
            onCompletedChange={setCompleted}
            title={card.name}
          />

          <CardBackQuickAdd
            boardRouteKey={boardRouteKey}
            cardId={card.id}
          />

          <CardBackDueDate dueDate={card.dueDate} />

          <CardBackDescription
            boardRouteKey={boardRouteKey}
            cardId={card.id}
            onChange={setDescription}
            value={description}
          />

          <CardBackAttachments attachments={card.attachments} />

          {card.checklists && card.checklists.length > 0 && (
            <CardBackChecklist card={card} />
          )}
        </div>

        <Suspense
          fallback={
            <div
              className={`${commentsPanelClassName} flex min-h-[min(40vh,240px)] items-center justify-center bg-zinc-900/80 px-4`}
            >
              <p className="text-sm text-zinc-500">Loading comments…</p>
            </div>
          }
        >
          <CardBackCommentsLazy
            boardRouteKey={boardRouteKey}
            cardId={card.id}
            className={commentsPanelClassName}
            initialComments={card.comments}
            onPanelOpenChange={onCommentsPanelOpenChange}
            panelOpen={commentsPanelOpen}
          />
        </Suspense>
      </div>

      <CardBackFooter
        commentsPanelOpen={commentsPanelOpen}
        onToggleCommentsPanel={() =>
          onCommentsPanelOpenChange(!commentsPanelOpen)
        }
      />
    </div>
  );
}

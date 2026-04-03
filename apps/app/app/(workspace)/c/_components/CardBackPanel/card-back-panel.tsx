"use client";

import { useEffect, useState } from "react";

import type { CardRouteBoardList } from "@/lib/api/cards/load-card-route";
import type { BoardCard } from "@/types/board-detail";

import { CardBackChecklist } from "../CardBackChecklist/card-back-checklist";
import { CardBackDescription } from "../CardBackDescription/card-back-description";
import { CardBackDueDate } from "../CardBackDueDate/card-back-due-date";
import { CardBackFooter } from "../CardBackFooter/card-back-footer";
import { CardBackHeader } from "../CardBackHeader/card-back-header";
import { CardBackQuickAdd } from "../CardBackQuickAdd/card-back-quickadd";
import { CardBackTitle } from "../CardBackTitle/card-back-title";
import { CardBackComments } from "../Comments/card-back-comments";

export type CardBackPanelProps = {
  boardLists: CardRouteBoardList[];
  boardName: string;
  boardRouteKey: string;
  card: BoardCard;
  listName: string;
  mode: "modal" | "page";
  onRequestClose: () => void;
};

export function CardBackPanel({
  boardLists,
  boardName,
  boardRouteKey,
  card,
  listName,
  mode,
  onRequestClose,
}: CardBackPanelProps) {
  const backHref = `/b/${encodeURIComponent(boardRouteKey)}`;

  const [description, setDescription] = useState(card.description ?? "");

  useEffect(() => {
    setDescription(card.description ?? "");
  }, [card.id, card.updatedAt]);

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-zinc-900 text-zinc-100 shadow-2xl lg:max-w-5xl">
      <CardBackHeader
        backHref={backHref}
        boardLists={boardLists}
        boardName={boardName}
        currentListId={card.listId}
        listName={listName}
        mode={mode}
        onRequestClose={onRequestClose}
      />

      <div className="flex max-h-[min(70vh,720px)] min-h-0 flex-col lg:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:min-w-0">
          <CardBackTitle mode={mode} title={card.name} />

          <CardBackQuickAdd />

          <CardBackDueDate dueDate={card.dueDate} />

          <CardBackDescription
            onChange={setDescription}
            value={description}
          />

          <CardBackChecklist card={card} />
        </div>

        <CardBackComments className="max-h-[min(40vh,360px)] shrink-0 border-zinc-800 border-t lg:max-h-none lg:w-[min(100%,380px)] lg:border-t-0 lg:border-l" />
      </div>

      <CardBackFooter />
    </div>
  );
}

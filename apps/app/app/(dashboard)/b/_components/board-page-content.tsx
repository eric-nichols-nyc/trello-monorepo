"use client";

import type { BoardDetail } from "@/types/board-detail";

import { TrelloBoard } from "./Board/trello-board";

type BoardPageContentProperties = {
  readonly board: BoardDetail;
};

export function BoardPageContent({ board }: BoardPageContentProperties) {
  return <TrelloBoard board={board} />;
}

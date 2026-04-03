import { notFound } from "next/navigation";

import type { BoardCard } from "@/types/board-detail";
import { normalizeBoardCard } from "@/types/board-detail";

import { BoardApiError } from "../boards/board-api-error";
import { getCard } from "./get-card";

export type CardRoutePayload = {
  card: BoardCard;
  listName: string;
  boardName: string;
  /** Segment for `/b/:key` (board `shortLink` when set, else id). */
  boardRouteKey: string;
};

function boardRouteKeyFromBoard(board: Record<string, unknown>): string {
  const sl = board.shortLink;
  if (typeof sl === "string" && sl.length > 0) {
    return sl;
  }
  return String(board.id);
}

/** Server load for `/c/:shortlink` (and modal intercept). */
export async function loadCardRoute(
  cardShortLink: string
): Promise<CardRoutePayload> {
  let raw: unknown;
  try {
    raw = await getCard(cardShortLink);
  } catch (error) {
    if (error instanceof BoardApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const record = raw as Record<string, unknown>;
  const board = record.board;
  if (board === null || typeof board !== "object") {
    notFound();
  }
  const boardRecord = board as Record<string, unknown>;

  const list = record.list;
  const listName =
    list !== null && typeof list === "object" && "name" in list
      ? String((list as Record<string, unknown>).name ?? "List")
      : "List";

  return {
    card: normalizeBoardCard(raw),
    listName,
    boardName: String(boardRecord.name ?? "Board"),
    boardRouteKey: boardRouteKeyFromBoard(boardRecord),
  };
}

import { notFound } from "next/navigation";

import type { BoardCard } from "@/types/board-detail";
import { normalizeBoardCard } from "@/types/board-detail";

import { BoardApiError } from "../boards/board-api-error";
import { getCard } from "./get-card";

export type CardRouteBoardList = {
  id: string;
  name: string;
};

export type CardRoutePayload = {
  card: BoardCard;
  listName: string;
  boardName: string;
  /** Lists on the card's board (open lists, plus the current list if it is closed). */
  boardLists: CardRouteBoardList[];
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

function boardListsForCardRoute(
  boardRecord: Record<string, unknown>,
  currentListId: string,
  currentListName: string
): CardRouteBoardList[] {
  const listsRaw = boardRecord.lists;
  if (!Array.isArray(listsRaw) || listsRaw.length === 0) {
    return [{ id: currentListId, name: currentListName }];
  }

  const parsed = listsRaw
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === "object")
    .map((l) => ({
      id: String(l.id),
      name: String(l.name ?? "List"),
      closed: Boolean(l.closed),
      pos: Number(l.pos),
    }))
    .sort((a, b) => a.pos - b.pos);

  const openOrCurrent = parsed.filter(
    (l) => !l.closed || l.id === currentListId
  );

  if (openOrCurrent.length === 0) {
    return [{ id: currentListId, name: currentListName }];
  }

  return openOrCurrent.map(({ id, name }) => ({ id, name }));
}

/** Server load for `/c/:shortlink` (and modal intercept). */
export async function loadCardRoute(
  cardShortLink: string
): Promise<CardRoutePayload> {
  let raw: unknown;
  try {
    raw = await getCard(cardShortLink);
    console.log("[loadCardRoute] getCard response:", raw);
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

  const card = normalizeBoardCard(raw);
  const boardLists = boardListsForCardRoute(
    boardRecord,
    card.listId,
    listName
  );

  return {
    card,
    listName,
    boardName: String(boardRecord.name ?? "Board"),
    boardLists,
    boardRouteKey: boardRouteKeyFromBoard(boardRecord),
  };
}

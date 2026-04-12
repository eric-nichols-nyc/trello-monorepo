import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardCard } from "@/types/board-detail";
import type { BoardDetail } from "@/types/board-detail";

import { useBoardListsCardData } from "./use-board-lists-card-data";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

function boardCard(overrides: Partial<BoardCard> = {}): BoardCard {
  const base: BoardCard = {
    id: "card-uuid-1",
    name: "Task",
    description: null,
    pos: 1,
    closed: false,
    completed: false,
    attachmentCount: 0,
    dueDate: null,
    shortLink: "cardShort",
    coverColor: null,
    coverImage: null,
    listId: "list-1",
    boardId: "board-1",
    assigneeId: null,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
    comments: [],
    checklists: [],
  };
  return { ...base, ...overrides };
}

function boardWithCards(cards: BoardCard[]): BoardDetail {
  return {
    id: "board-1",
    name: "Sprint",
    shortLink: "brd",
    background: null,
    backgroundImage: null,
    backgroundBrightness: "dark",
    backgroundBottomColor: null,
    backgroundTopColor: null,
    backgroundColor: null,
    starred: false,
    closed: false,
    userId: "user-1",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
    lists: [
      {
        id: "list-1",
        name: "Todo",
        pos: 100,
        closed: false,
        boardId: "board-1",
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
        cards,
      },
    ],
  };
}

describe("useBoardListsCardData", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("handleOpenCard navigates with shortLink when present", async () => {
    const board = boardWithCards([boardCard({ id: "c1", shortLink: "abc12" })]);
    const { result } = renderHook(() => useBoardListsCardData(board));

    result.current.handleOpenCard("c1");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/c/abc12");
    });
  });

  it("handleOpenCard navigates with card id when shortLink is empty", async () => {
    const board = boardWithCards([
      boardCard({ id: "temp-xyz", shortLink: "", name: "New" }),
    ]);
    const { result } = renderHook(() => useBoardListsCardData(board));

    result.current.handleOpenCard("temp-xyz");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/c/temp-xyz");
    });
  });

  it("handleOpenCard encodes the segment for the URL", async () => {
    const board = boardWithCards([
      boardCard({ id: "c1", shortLink: "a/b" }),
    ]);
    const { result } = renderHook(() => useBoardListsCardData(board));

    result.current.handleOpenCard("c1");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/c/a%2Fb");
    });
  });

  it("handleOpenCard does nothing when card id is unknown", () => {
    const board = boardWithCards([boardCard({ id: "known" })]);
    const { result } = renderHook(() => useBoardListsCardData(board));

    result.current.handleOpenCard("missing-id");

    expect(pushMock).not.toHaveBeenCalled();
  });
});

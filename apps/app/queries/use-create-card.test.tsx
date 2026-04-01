import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardDetail } from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";
import { useCreateCard } from "./use-create-card";

const postCardClientMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: "server-card" })
);

vi.mock("@repo/clerk/client", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("test-token"),
  }),
}));

vi.mock("@/lib/api/cards/post-card-client", () => ({
  postCardClient: postCardClientMock,
}));

function boardDetailFixture(): BoardDetail {
  return {
    id: "board-1",
    name: "Sprint",
    shortLink: "abc",
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
        cards: [],
      },
    ],
  };
}

describe("useCreateCard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    postCardClientMock.mockClear();
    postCardClientMock.mockResolvedValue({ id: "server-card" });
    vi.stubGlobal("crypto", {
      randomUUID: () => "00000000-0000-4000-8000-000000000099",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function wrapperFor(client: QueryClient) {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
    };
  }

  it("appends an optimistic card to the matching list", async () => {
    const boardKey = "my-board";
    queryClient.setQueryData(
      boardDetailQueryKey(boardKey),
      boardDetailFixture()
    );

    const { result } = renderHook(() => useCreateCard(), {
      wrapper: wrapperFor(queryClient),
    });

    result.current.mutate({
      listId: "list-1",
      boardKey,
      input: { name: "New task" },
    });

    await waitFor(() => {
      const detail = queryClient.getQueryData<BoardDetail>(
        boardDetailQueryKey(boardKey)
      );
      expect(detail?.lists[0]?.cards).toHaveLength(1);
      expect(detail?.lists[0]?.cards[0]).toMatchObject({
        id: "temp-00000000-0000-4000-8000-000000000099",
        name: "New task",
        listId: "list-1",
        boardId: "board-1",
      });
    });

    expect(postCardClientMock).toHaveBeenCalledWith(
      "list-1",
      { name: "New task" },
      "test-token"
    );
  });

  it("restores previous cache data when the request fails", async () => {
    const boardKey = "my-board";
    const previous = boardDetailFixture();
    queryClient.setQueryData(boardDetailQueryKey(boardKey), previous);

    postCardClientMock.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useCreateCard(), {
      wrapper: wrapperFor(queryClient),
    });

    result.current.mutate({
      listId: "list-1",
      boardKey,
      input: { name: "Broken" },
    });

    await waitFor(() => {
      expect(postCardClientMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      const detail = queryClient.getQueryData<BoardDetail>(
        boardDetailQueryKey(boardKey)
      );
      expect(detail?.lists[0]?.cards).toHaveLength(0);
    });
  });
});

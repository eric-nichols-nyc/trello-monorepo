"use client";

import { cn } from "@repo/design-system/lib/utils";
import Link from "next/link";
import { useMemo, type ComponentType } from "react";

import { BoardTile } from "@/app/(workspace)/w/_components/board-tile/board-tile";
import type { MyWorkspaceSummary } from "@/lib/api/workspaces/get-my-workspaces";
import {
  getBoardId,
  getBoardStringField,
  getBoardWorkspaceId,
  getStableBoardKey,
  sortBoardsRecentFirst,
} from "@/lib/boards/board-list-utils";

export type BoardSwitcherPanelProps = {
  readonly boards: readonly unknown[];
  /** Route key for the board page (`shortLink` or id). */
  readonly currentBoardKey: string;
  readonly searchQuery: string;
  readonly workspaceSummaries: readonly MyWorkspaceSummary[];
  /** @default {@link BoardTile} */
  readonly BoardTileComponent?: ComponentType<{ readonly board: unknown }>;
};

function boardMatchesRouteKey(board: unknown, routeKey: string): boolean {
  const shortLink = getBoardStringField(board, "shortLink");
  const id = getBoardId(board);
  return routeKey === shortLink || routeKey === id;
}

function workspaceLabelForBoard(
  board: unknown,
  summaries: readonly MyWorkspaceSummary[]
): string | undefined {
  const fromApi = getBoardStringField(board, "workspaceName");
  if (fromApi !== undefined) {
    return fromApi;
  }
  const workspaceId = getBoardWorkspaceId(board);
  if (workspaceId === undefined) {
    return;
  }
  return summaries.find((w) => w.id === workspaceId)?.name;
}

export function BoardSwitcherPanel({
  boards,
  currentBoardKey,
  searchQuery,
  workspaceSummaries,
  BoardTileComponent = BoardTile,
}: BoardSwitcherPanelProps) {
  const sorted = useMemo(() => sortBoardsRecentFirst(boards), [boards]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return sorted;
    }
    return sorted.filter((board) => {
      const name = getBoardStringField(board, "name")?.toLowerCase() ?? "";
      const ws = workspaceLabelForBoard(
        board,
        workspaceSummaries
      )?.toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        (ws?.includes(normalizedQuery) === true)
      );
    });
  }, [normalizedQuery, sorted, workspaceSummaries]);

  if (sorted.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-10 text-center text-sm text-white/65">
        <p className="m-0">No boards yet.</p>
        <Link
          className="mt-3 inline-block font-medium text-blue-400 hover:text-blue-300"
          href="/w"
        >
          Go to workspace
        </Link>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-10 text-center text-sm text-white/65">
        <p className="m-0">No boards match your search.</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
        {filtered.map((board, index) => {
          const key = getStableBoardKey(board, index);
          const isCurrent = boardMatchesRouteKey(board, currentBoardKey);
          return (
            <li
              className={cn(
                "min-w-0 rounded-xl",
                isCurrent === true
                  ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[rgb(24,24,26)]"
                  : null
              )}
              key={key}
            >
              <BoardTileComponent board={board} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

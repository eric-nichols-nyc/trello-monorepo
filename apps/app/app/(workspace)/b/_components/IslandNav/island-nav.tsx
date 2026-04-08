"use client";

import { cn } from "@repo/design-system/lib/utils";
import { Calendar, Inbox, LayoutGrid, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useWorkspaceShellBoards } from "@/app/(workspace)/_components/workspace-shell-context";

import { BoardSwitcher } from "../BoardSwitcher/board-switcher";

const TRAILING_SLASH = /\/$/;

export type IslandNavProps = {
  /** Current board route key (`/b/[boardKey]`). */
  readonly boardKey: string;
};

function IslandDivider() {
  return (
    <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-white/15" />
  );
}

function islandItemClasses(active: boolean): string {
  return cn(
    "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "text-blue-400"
      : "text-white/70 hover:bg-white/6 hover:text-white/90"
  );
}

function islandDisabledItemClasses(): string {
  return cn(
    "relative flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
    "text-white/35"
  );
}

/**
 * Floating pill nav (dock) for board view — Inbox, Planner, Board, Switch boards.
 */
export function IslandNav({ boardKey }: IslandNavProps) {
  const pathname = usePathname();
  const boards = useWorkspaceShellBoards();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const boardHref = `/b/${encodeURIComponent(boardKey)}`;
  const pathNorm = pathname.replace(TRAILING_SLASH, "") || "/";
  const boardPathNorm = boardHref.replace(TRAILING_SLASH, "");
  const isBoardActive = pathNorm === boardPathNorm;

  return (
    <>
      <BoardSwitcher
        boards={boards}
        currentBoardKey={boardKey}
        onClose={() => {
          setSwitcherOpen(false);
        }}
        open={switcherOpen}
      />
      <nav
        aria-label="Workspace navigation"
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2"
      >
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/10",
            "bg-[rgb(28,28,30)]/92 px-1 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          )}
        >
          <button
            className={islandDisabledItemClasses()}
            disabled
            title="Coming soon"
            type="button"
          >
            <Inbox aria-hidden className="relative z-1 size-4 shrink-0" strokeWidth={1.75} />
            <span className="relative z-1">Inbox</span>
          </button>
          <button
            className={islandDisabledItemClasses()}
            disabled
            title="Coming soon"
            type="button"
          >
            <Calendar aria-hidden className="relative z-1 size-4 shrink-0" strokeWidth={1.75} />
            <span className="relative z-1">Planner</span>
          </button>
          <Link className={islandItemClasses(isBoardActive)} href={boardHref}>
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 rounded-lg",
                isBoardActive ? "bg-blue-600/25" : null
              )}
            />
            <LayoutGrid
              aria-hidden
              className="relative z-1 size-4 shrink-0"
              strokeWidth={isBoardActive ? 2 : 1.75}
            />
            <span className="relative z-1">Board</span>
            {isBoardActive ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-1 left-1/2 z-1 h-0.5 w-7 -translate-x-1/2 rounded-full bg-blue-400"
              />
            ) : null}
          </Link>
          <IslandDivider />
          <button
            className={islandItemClasses(false)}
            onClick={() => {
              setSwitcherOpen(true);
            }}
            type="button"
          >
            <Layers aria-hidden className="relative z-1 size-4 shrink-0" strokeWidth={1.75} />
            <span className="relative z-1">Switch boards</span>
          </button>
        </div>
      </nav>
    </>
  );
}

"use client";

import type { MyWorkspaceSummary } from "@/lib/api/workspaces/get-my-workspaces";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";

import { BoardSwitcherHeader } from "./board-switcher-header";
import { BoardSwitcherPanel } from "./board-switcher-panel";

export type BoardSwitcherViewProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly currentBoardKey: string;
  readonly boards: readonly unknown[];
  readonly workspaceSummaries: readonly MyWorkspaceSummary[];
  /** From `usePathname()` — used to auto-close when the route changes. */
  readonly pathname: string;
  /**
   * Optional tile renderer (e.g. Storybook stub without React Query).
   * @default production {@link BoardTile} via panel default.
   */
  readonly boardTileComponent?: ComponentType<{ readonly board: unknown }>;
};

/**
 * Presentational board switcher: portal, search, and panel. Pass workspace data and
 * `pathname` from a thin container or from Storybook mocks.
 */
export function BoardSwitcherView({
  open,
  onClose,
  currentBoardKey,
  boards,
  workspaceSummaries,
  pathname,
  boardTileComponent,
}: BoardSwitcherViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const pathWhenOpenedRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      if (!wasOpenRef.current) {
        pathWhenOpenedRef.current = pathname;
      }
    } else {
      pathWhenOpenedRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open, pathname]);

  useEffect(() => {
    if (!open || pathWhenOpenedRef.current === null) {
      return;
    }
    if (pathname !== pathWhenOpenedRef.current) {
      onClose();
    }
  }, [open, pathname, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted) {
    return null;
  }
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-100">
      <button
        aria-label="Dismiss board switcher"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center px-3 pb-12">
        <div
          aria-label="Switch boards"
          aria-modal="true"
          className={cn(
            "pointer-events-auto flex max-h-[calc(100vh-3rem)] w-[min(100vw-1.5rem,560px)] flex-col",
            "h-[min(90vh,680px)]",
            "overflow-hidden rounded-2xl border border-white/10 bg-[rgb(24,24,26)] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          )}
          role="dialog"
        >
          <BoardSwitcherHeader
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
          <BoardSwitcherPanel
            BoardTileComponent={boardTileComponent}
            boards={boards}
            currentBoardKey={currentBoardKey}
            searchQuery={searchQuery}
            workspaceSummaries={workspaceSummaries}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

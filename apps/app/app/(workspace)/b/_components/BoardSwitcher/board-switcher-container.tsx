"use client";

import { useWorkspaceShellWorkspaces } from "@/app/(workspace)/_components/workspace-shell-context";
import { usePathname } from "next/navigation";

import { BoardSwitcherView, type BoardSwitcherViewProps } from "./board-switcher-view";

export type BoardSwitcherProps = Omit<
  BoardSwitcherViewProps,
  "pathname" | "workspaceSummaries"
>;

/**
 * Board switcher wired to {@link useWorkspaceShellWorkspaces} and `usePathname`.
 */
export function BoardSwitcher({
  boards,
  currentBoardKey,
  onClose,
  open,
  boardTileComponent,
}: BoardSwitcherProps) {
  const pathname = usePathname();
  const workspaceSummaries = useWorkspaceShellWorkspaces();

  return (
    <BoardSwitcherView
      boardTileComponent={boardTileComponent}
      boards={boards}
      currentBoardKey={currentBoardKey}
      onClose={onClose}
      open={open}
      pathname={pathname}
      workspaceSummaries={workspaceSummaries}
    />
  );
}

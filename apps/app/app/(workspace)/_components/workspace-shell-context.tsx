"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
} from "react";

import type { MyWorkspaceSummary } from "@/lib/api/workspaces/get-my-workspaces";

export type WorkspaceShellValue = {
  readonly workspaces: readonly MyWorkspaceSummary[];
  /** Boards from layout `getMyBoards` (same list as header search). */
  readonly boards: readonly unknown[];
  /**
   * Initials from Nest `GET /users/me` (server), computed in `(workspace)/layout`.
   * Lets board chrome show the current member without a client `me` query.
   */
  readonly currentUserInitials: string;
};

const WorkspaceShellContext = createContext<WorkspaceShellValue>({
  workspaces: [],
  boards: [],
  currentUserInitials: "?",
});

export function WorkspaceShellProvider({
  workspaces,
  boards = [],
  currentUserInitials,
  children,
}: {
  readonly workspaces: readonly MyWorkspaceSummary[];
  readonly boards?: readonly unknown[];
  readonly currentUserInitials: string;
  readonly children: ReactNode;
}) {
  const value = useMemo<WorkspaceShellValue>(
    () => ({ workspaces, boards, currentUserInitials }),
    [workspaces, boards, currentUserInitials]
  );

  return (
    <WorkspaceShellContext.Provider value={value}>
      {children}
    </WorkspaceShellContext.Provider>
  );
}

export function useWorkspaceShellWorkspaces(): readonly MyWorkspaceSummary[] {
  return useContext(WorkspaceShellContext).workspaces;
}

export function useWorkspaceShellBoards(): readonly unknown[] {
  return useContext(WorkspaceShellContext).boards;
}

export function useWorkspaceShellCurrentUserInitials(): string {
  return useContext(WorkspaceShellContext).currentUserInitials;
}

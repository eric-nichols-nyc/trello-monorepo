"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { MyWorkspaceSummary } from "@/lib/api/workspaces/get-my-workspaces";

const WorkspaceShellContext = createContext<readonly MyWorkspaceSummary[]>(
  []
);

export function WorkspaceShellProvider({
  workspaces,
  children,
}: {
  readonly workspaces: readonly MyWorkspaceSummary[];
  readonly children: ReactNode;
}) {
  return (
    <WorkspaceShellContext.Provider value={workspaces}>
      {children}
    </WorkspaceShellContext.Provider>
  );
}

export function useWorkspaceShellWorkspaces(): readonly MyWorkspaceSummary[] {
  return useContext(WorkspaceShellContext);
}

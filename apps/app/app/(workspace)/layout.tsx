import type { ReactNode } from "react";
import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { getMyBoards } from "@/lib/api/boards/get-boards";
import { getCurrentUserInitialsFromApi } from "@/lib/api/users/get-current-user-initials";
import {
  getMyWorkspaces,
  type MyWorkspaceSummary,
} from "@/lib/api/workspaces/get-my-workspaces";
import { WorkspaceShellProvider } from "./_components/workspace-shell-context";
import { WorkspaceProvisionWait } from "./_components/workspace-provision-wait";
import { GlobalHeader } from "./w/_components/global-header/global-header";

type WorkspaceLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

/**
 * Result of talking to Nest (`GET /workspaces/mine`) before rendering workspace chrome.
 *
 * - **`ready`**: at least one workspace — safe to show `GlobalHeader` + child routes.
 * - **`wait`**: block children and show {@link WorkspaceProvisionWait} (retry / sign out).
 */
type WorkspaceGateState =
  | { kind: "ready"; workspaces: MyWorkspaceSummary[] }
  | {
      kind: "wait";
      /** `provisioning`: 404 or empty list (Clerk user exists, DB row/workspace not ready yet). */
      variant: "provisioning" | "error";
      /** Optional message for `error` (network, 5xx, config). */
      detail?: string;
    };

/**
 * Server-only: calls Nest with the current Clerk session token.
 * Maps API outcomes to {@link WorkspaceGateState} without throwing (layout always renders).
 */
async function loadWorkspaceGateState(): Promise<WorkspaceGateState> {
  try {
    const workspaces = await getMyWorkspaces();
    // Webhook should create a default workspace; [] still treated as “still syncing”.
    if (workspaces.length === 0) {
      return {
        kind: "wait",
        variant: "provisioning",
      };
    }
    return { kind: "ready", workspaces };
  } catch (e) {
    // Nest `GET /workspaces/mine` → 404 when `User` row missing for this `clerkUserId`.
    if (e instanceof BoardApiError && e.status === 404) {
      return { kind: "wait", variant: "provisioning" };
    }
    const detail = e instanceof Error ? e.message : "Unknown error";
    return { kind: "wait", variant: "error", detail };
  }
}

/**
 * Shell for all routes under `(workspace)` (e.g. `/w`, boards).
 * Gates on Nest workspace list so users don’t see a broken header while the Clerk webhook
 * provisions `User` + default workspace.
 */
export default async function WorkspaceLayout({
  children,
  modal,
}: WorkspaceLayoutProps) {
  const state = await loadWorkspaceGateState();

  // Full-screen wait UI only — no `GlobalHeader` / no `children` (avoids nested 404 flashes).
  if (state.kind === "wait") {
    return (
      <>
        <WorkspaceProvisionWait
          detail={state.detail}
          variant={state.variant}
        />
        {modal}
      </>
    );
  }

  const defaultWorkspaceId = state.workspaces[0]?.id ?? null;

  let initialBoards: readonly unknown[] = [];
  try {
    const raw = await getMyBoards();
    initialBoards = Array.isArray(raw) ? raw : [];
  } catch {
    initialBoards = [];
  }

  // Same Nest session as workspaces; avoids a client-side `me` query for header facepile initials.
  const currentUserInitials = await getCurrentUserInitialsFromApi();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <GlobalHeader
        initialBoards={initialBoards}
        workspaceId={defaultWorkspaceId}
        workspaceSummaries={state.workspaces}
      />
      <WorkspaceShellProvider
        boards={initialBoards}
        currentUserInitials={currentUserInitials}
        workspaces={state.workspaces}
      >
        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
          {modal}
        </div>
      </WorkspaceShellProvider>
    </div>
  );
}

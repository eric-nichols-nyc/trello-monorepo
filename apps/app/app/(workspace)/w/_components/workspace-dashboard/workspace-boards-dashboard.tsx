"use client";

import { useAuth } from "@repo/clerk/client";
import { Separator } from "@repo/design-system/components/ui/separator";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { patchWorkspaceClient } from "@/lib/api/workspaces/patch-workspace-client";
import { EmptyBoards } from "../empty-boards/empty-boards";
import { WorkspaceBanner } from "../workspace-banner/workspace-banner";
import type { WorkspaceBannerFormValues } from "../workspace-banner/workspace-banner-form";
import { WorkspaceBoardsWorkspacePanel } from "./workspace-boards-workspace-panel";

type WorkspaceBoardsDashboardProps = {
  readonly boards: readonly unknown[];
  readonly workspace: {
    readonly id: string;
    readonly name: string;
    readonly description: string | null;
  } | null;
};

const isBoardInWorkspace = (
  board: unknown,
  workspaceId: string,
): boolean => {
  if (
    board !== null &&
    typeof board === "object" &&
    "workspaceId" in board &&
    typeof (board as { workspaceId: unknown }).workspaceId === "string"
  ) {
    return (board as { workspaceId: string }).workspaceId === workspaceId;
  }
  return false;
};

export const WorkspaceBoardsDashboard = ({
  boards,
  workspace,
}: WorkspaceBoardsDashboardProps) => {
  const { getToken } = useAuth();
  const router = useRouter();

  const scopedBoards = workspace
    ? boards.filter((b) => isBoardInWorkspace(b, workspace.id))
    : boards;

  const workspaceId = workspace?.id ?? null;
  const workspaceName = workspace?.name ?? "Trello workspace";

  const handleWorkspaceSave = useCallback(
    async (values: WorkspaceBannerFormValues) => {
      if (!workspace?.id) {
        return;
      }
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      await patchWorkspaceClient(
        workspace.id,
        {
          name: values.name,
          description:
            values.description.trim() === "" ? null : values.description.trim(),
        },
        token,
      );
      router.refresh();
    },
    [getToken, router, workspace?.id],
  );

  return (
    <div className="mx-auto max-w-[914px] space-y-6 px-6">
      <WorkspaceBanner
        editable
        initialDescription={workspace?.description ?? ""}
        onWorkspaceSave={handleWorkspaceSave}
        visibilityLabel="Private"
        workspaceName={workspaceName}
      />
      <Separator className="bg-chrome-divider" />
      {scopedBoards.length === 0 ? (
        <EmptyBoards workspaceId={workspaceId} />
      ) : (
        <WorkspaceBoardsWorkspacePanel
          boards={scopedBoards}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
};

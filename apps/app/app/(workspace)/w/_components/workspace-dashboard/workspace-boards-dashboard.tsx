import { Separator } from "@repo/design-system/components/ui/separator";
import { EmptyBoards } from "../empty-boards/empty-boards";
import { WorkspaceBanner } from "../workspace-banner/workspace-banner";
import { WorkspaceBoardsWorkspacePanel } from "./workspace-boards-workspace-panel";

type WorkspaceBoardsDashboardProps = {
  readonly boards: readonly unknown[];
  readonly workspace: { readonly id: string; readonly name: string } | null;
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
  const scopedBoards = workspace
    ? boards.filter((b) => isBoardInWorkspace(b, workspace.id))
    : boards;

  const workspaceId = workspace?.id ?? null;
  const workspaceName = workspace?.name ?? "Trello workspace";

  return (
    <div className="mx-auto max-w-[914px] space-y-6 px-12">
      <WorkspaceBanner
        editable
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

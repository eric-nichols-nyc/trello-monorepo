import { Separator } from "@repo/design-system/components/ui/separator";
import { getMyBoards } from "@/lib/api/boards/get-boards";
import { getMyWorkspaces } from "@/lib/api/workspaces/get-my-workspaces";
import { EmptyBoards } from "./_components/empty-boards/empty-boards";
import { WorkspaceBanner } from "./_components/workspace-banner/workspace-banner";
import { WorkspaceBoardsHome } from "./_components/workspace-boards-home/workspace-boards-home";

export default async function DashboardPage() {
  let boards: readonly unknown[] = [];
  let defaultWorkspaceId: string | null = null;

  try {
    const userBoards = await getMyBoards();
    if (Array.isArray(userBoards)) {
      boards = userBoards;
    }
  } catch {
    boards = [];
  }

  try {
    const workspaces = await getMyWorkspaces();
    defaultWorkspaceId = workspaces[0]?.id ?? null;
  } catch {
    defaultWorkspaceId = null;
  }

  return (
    <div className="mx-auto max-w-[914px] px-12 space-y-6">
      <WorkspaceBanner
        editable
        visibilityLabel="Private"
        workspaceName="Trello workspace"
      />
      <Separator className="bg-chrome-divider" />
      {boards.length === 0 ? (
        <EmptyBoards workspaceId={defaultWorkspaceId} />
      ) : (
        <WorkspaceBoardsHome boards={boards} />
      )}
    </div>
  );
}

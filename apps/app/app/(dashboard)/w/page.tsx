import { Separator } from "@repo/design-system/components/ui/separator";
import { getMyBoards } from "@/lib/api/boards/get-boards";
import { EmptyBoards } from "./_components/empty-boards/empty-boards";
import { WorkspaceBanner } from "./_components/workspace-banner/workspace-banner";
import { WorkspaceBoardsHome } from "./_components/workspace-boards-home/workspace-boards-home";

export default async function DashboardPage() {
  let boards: readonly unknown[] = [];

  try {
    const userBoards = await getMyBoards();
    if (Array.isArray(userBoards)) {
      boards = userBoards;
    }
  } catch {
    boards = [];
  }

  return (
    <div className="mx-auto max-w-[914px] space-y-6">
      <WorkspaceBanner
        editable
        visibilityLabel="Private"
        workspaceName="Trello workspace"
      />
      <Separator className="bg-chrome-divider" />
      {boards.length === 0 ? (
        <EmptyBoards />
      ) : (
        <WorkspaceBoardsHome boards={boards} />
      )}
    </div>
  );
}

import { Separator } from "@repo/design-system/components/ui/separator";
import { DUMMY_BOARDS } from "@/data/dummy-boards";
import { getMyBoards } from "@/lib/api/boards/get-boards";
import { WorkspaceBanner } from "./_components/workspace-banner/workspace-banner";
import { WorkspaceBoardsHome } from "./_components/workspace-boards-home/workspace-boards-home";

export default async function DashboardPage() {
  let boards: readonly unknown[] = DUMMY_BOARDS;

  try {
    const userBoards = await getMyBoards();
    console.log("User boards:", userBoards);
    if (Array.isArray(userBoards)) {
      boards = userBoards;
    }
  } catch (error) {
    console.error("getMyBoards failed:", error);
  }

  return (
    <div className="mx-auto max-w-[914px] space-y-6">
      <WorkspaceBanner
        editable
        visibilityLabel="Private"
        workspaceName="Trello workspace"
      />
      <Separator className="bg-chrome-divider" />
      <WorkspaceBoardsHome boards={boards} />
    </div>
  );
}

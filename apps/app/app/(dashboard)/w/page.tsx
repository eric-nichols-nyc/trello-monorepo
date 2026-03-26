import { Separator } from "@repo/design-system/components/ui/separator";
import { WorkspaceBanner } from "./_components/workspace-banner/workspace-banner";
import { WorkspaceBoardsHome } from "./_components/workspace-boards-home/workspace-boards-home";
import { DUMMY_BOARDS } from "@/data/dummy-boards";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[914px] space-y-6">
      <WorkspaceBanner
        editable
        visibilityLabel="Private"
        workspaceName="Trello workspace"
      />
      <Separator className="bg-chrome-divider" />
      <WorkspaceBoardsHome boards={DUMMY_BOARDS} />
    </div>
  );
}

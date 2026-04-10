import { notFound } from "next/navigation";
import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { getMyBoards } from "@/lib/api/boards/get-boards";
import { getMyWorkspaces } from "@/lib/api/workspaces/get-my-workspaces";
import { resolveWorkspaceFromSegment } from "@/lib/workspaces/workspace-routing";
import { WorkspaceBoardsDashboard } from "../_components/workspace-dashboard/workspace-boards-dashboard";

type WorkspaceIdPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkspaceIdPage({ params }: WorkspaceIdPageProps) {
  const { id: segment } = await params;

  let workspaces: Awaited<ReturnType<typeof getMyWorkspaces>> = [];
  try {
    workspaces = await getMyWorkspaces();
  } catch (error) {
    const detail =
      error instanceof BoardApiError
        ? `HTTP ${error.status} ${error.message}`
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(`[w/[id]] getMyWorkspaces failed — ${detail}`);
    notFound();
  }

  const workspace = resolveWorkspaceFromSegment(workspaces, segment);
  if (!workspace) {
    notFound();
  }

  let boards: readonly unknown[] = [];
  try {
    const userBoards = await getMyBoards();
    if (Array.isArray(userBoards)) {
      boards = userBoards;
    }
  } catch {
    boards = [];
  }

  console.log("[workspace /w/[id]] workspaceId:", workspace.id);

  return (
    <WorkspaceBoardsDashboard
      boards={boards}
      workspace={{
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
      }}
    />
  );
}

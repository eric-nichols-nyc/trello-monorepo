import { redirect } from "next/navigation";
import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { getMyBoards } from "@/lib/api/boards/get-boards";
import { getMyWorkspaces } from "@/lib/api/workspaces/get-my-workspaces";
import { workspaceUrlSegment } from "@/lib/workspaces/workspace-routing";
import { WorkspaceBoardsDashboard } from "./_components/workspace-boards-dashboard";

export default async function WorkSpacePage() {
  let workspaces: Awaited<ReturnType<typeof getMyWorkspaces>> = [];
  try {
    workspaces = await getMyWorkspaces();
    if (workspaces.length === 0) {
      console.warn(
        "[workspace page] GET /workspaces/mine returned 0 rows. If a row exists in the DB, its ownerId must match your app User.id for the current Clerk account (see User.clerkUserId).",
      );
    }
  } catch (error) {
    const detail =
      error instanceof BoardApiError
        ? `HTTP ${error.status} ${error.message}`
        : error instanceof Error
          ? `${error.name}: ${error.message}${error.cause != null ? ` | cause: ${String(error.cause)}` : ""}`
          : String(error);
    console.error(`[workspace page] getMyWorkspaces failed — ${detail}`);
    workspaces = [];
  }

  if (workspaces.length > 0) {
    redirect(`/w/${workspaceUrlSegment(workspaces[0])}`);
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

  console.log("[workspace page] workspaceId: null (no workspaces; staying on /w)");

  return <WorkspaceBoardsDashboard boards={boards} workspace={null} />;
}

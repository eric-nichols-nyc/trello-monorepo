import { getMyWorkspaces } from "@/lib/api/workspaces/get-my-workspaces";
import { GlobalHeader } from "./(workspace)/w/_components/global-header/global-header";
import { NotFoundContent } from "./not-found-content";

/**
 * 404 for URLs that never enter a route (no matching segment). Root layout only —
 * include the same chrome as the workspace shell.
 */
export default async function NotFound() {
  let defaultWorkspaceId: string | null = null;
  try {
    const workspaces = await getMyWorkspaces();
    defaultWorkspaceId = workspaces[0]?.id ?? null;
  } catch {
    defaultWorkspaceId = null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GlobalHeader workspaceId={defaultWorkspaceId} />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-auto">
        <NotFoundContent />
      </div>
    </div>
  );
}

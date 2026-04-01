import type { MyWorkspaceSummary } from "@/lib/api/workspaces/get-my-workspaces";

export function workspaceUrlSegment(
  workspace: Pick<MyWorkspaceSummary, "id" | "shortLink">,
): string {
  if (workspace.shortLink && workspace.shortLink.trim() !== "") {
    return workspace.shortLink;
  }
  return workspace.id;
}

export function resolveWorkspaceFromSegment(
  workspaces: readonly MyWorkspaceSummary[],
  segment: string,
): MyWorkspaceSummary | null {
  return (
    workspaces.find(
      (w) => w.id === segment || w.shortLink === segment,
    ) ?? null
  );
}

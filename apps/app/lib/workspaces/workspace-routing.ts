import type { MyWorkspaceSummary } from "@/lib/api/workspaces/get-my-workspaces";

/** `/w/*` routes that are not a workspace id/shortLink segment. */
const WORKSPACE_ROUTE_ROOT_SEGMENTS = new Set([
  "templates",
  "members",
  "settings",
  "new",
]);

/**
 * Returns the first URL segment under `/w` that identifies a workspace, or `null`
 * for `/w`, `/w/templates`, etc.
 */
export function workspaceSegmentFromPathname(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "w" || parts.length < 2) {
    return null;
  }
  const candidate = parts[1];
  if (WORKSPACE_ROUTE_ROOT_SEGMENTS.has(candidate)) {
    return null;
  }
  return candidate;
}

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

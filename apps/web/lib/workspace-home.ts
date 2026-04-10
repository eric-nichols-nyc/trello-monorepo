import { safeNextPath } from "../components/auth-utils";

type WorkspaceRow = {
  shortLink: string | null;
};

/**
 * Resolves where to send the user after auth.
 * If the target is exactly `/workspace`, loads the user's workspaces from the API
 * and redirects to `/workspace/{shortLink}` (most recently updated first).
 * Any other safe path (e.g. `/workspace/my-slug`, `/profile`) is left as-is.
 */
export async function resolvePostAuthPath(
  nextPath: string | null | undefined,
  fallback = "/workspace",
): Promise<string> {
  const path = safeNextPath(nextPath, fallback);
  if (path !== "/workspace") {
    return path;
  }

  try {
    const res = await fetch("/api/workspaces", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      return "/workspace";
    }
    const list = (await res.json()) as WorkspaceRow[];
    if (!Array.isArray(list) || list.length === 0) {
      return "/workspace";
    }
    const slug = list[0]?.shortLink?.trim();
    if (!slug) {
      return "/workspace";
    }
    return `/workspace/${encodeURIComponent(slug)}`;
  } catch {
    return "/workspace";
  }
}

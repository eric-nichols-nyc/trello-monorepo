import { auth } from "@repo/clerk/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

export type MyWorkspaceSummary = {
  readonly id: string;
  readonly name: string;
  readonly shortLink: string | null;
};

/**
 * Server-only: list workspaces owned by the signed-in user (Nest `GET /workspaces/mine`).
 */
export async function getMyWorkspaces(): Promise<MyWorkspaceSummary[]> {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not set");
  }

  const url = `${baseUrl}/api/workspaces/mine`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch (cause) {
    const msg =
      cause instanceof Error ? cause.message : String(cause);
    throw new Error(`getMyWorkspaces: fetch failed (${url}): ${msg}`, {
      cause,
    });
  }

  if (!response.ok) {
    const body = await response.text();
    throw new BoardApiError(
      response.status,
      `${response.status} ${body}`.trim(),
    );
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  const rows = data
    .filter(
      (row): row is Record<string, unknown> =>
        typeof row === "object" && row !== null,
    )
    .map((row): MyWorkspaceSummary | null => {
      const id = row.id;
      const name = row.name;
      if (typeof id !== "string" || typeof name !== "string") {
        return null;
      }
      const raw = row.shortLink;
      const shortLink =
        raw === null || raw === undefined
          ? null
          : typeof raw === "string"
            ? raw
            : null;
      return { id, name, shortLink };
    })
    .filter((row): row is MyWorkspaceSummary => row !== null);

  if (data.length > 0 && rows.length === 0) {
    console.error(
      "[getMyWorkspaces] API returned",
      data.length,
      "row(s) but none matched expected shape. First item:",
      JSON.stringify(data[0]),
    );
  }

  return rows;
}

import { auth } from "@repo/clerk/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

export type MyWorkspaceSummary = {
  readonly id: string;
  readonly name: string;
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

  const response = await fetch(`${baseUrl}/api/workspaces/mine`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (row): row is MyWorkspaceSummary =>
      typeof row === "object" &&
      row !== null &&
      "id" in row &&
      typeof (row as { id: unknown }).id === "string" &&
      "name" in row &&
      typeof (row as { name: unknown }).name === "string"
  );
}

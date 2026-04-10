import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

export type PatchWorkspaceBody = {
  name?: string;
  description?: string | null;
};

/** PATCH `/api/workspaces/:id` on Nest; pass `await useAuth().getToken()`. */
export async function patchWorkspaceClient(
  workspaceId: string,
  body: PatchWorkspaceBody,
  token: string,
): Promise<unknown> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/workspaces/${encodeURIComponent(workspaceId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

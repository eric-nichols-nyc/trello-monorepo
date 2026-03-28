import { NextResponse } from "next/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { postCard } from "@/lib/api/cards/post-card";

/**
 * Same-origin proxy for Nest `POST /api/lists/:listId/cards`.
 *
 * The browser calls `/api/lists/{listId}/cards` on Next; this handler attaches
 * the Clerk token and forwards the JSON body to `API_URL` (see `postCard`).
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const { listId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = await postCard(listId, body);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BoardApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/lists/[listId]/cards]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

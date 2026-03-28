import { NextResponse } from "next/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { postList } from "@/lib/api/lists/post-list";

/**
 * Same-origin proxy for Nest `POST /api/boards/:boardId/lists`.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = await postList(boardId, body);
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
    console.error("[POST /api/boards/id/[boardId]/lists]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

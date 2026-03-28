import { NextResponse } from "next/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { reorderListCards } from "@/lib/api/cards/reorder-list-cards";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const { listId } = await context.params;

  let body: { cardIds?: string[] };
  try {
    body = (await request.json()) as { cardIds?: string[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.cardIds) || body.cardIds.length === 0) {
    return NextResponse.json(
      { error: "cardIds must be a non-empty array" },
      { status: 400 }
    );
  }

  try {
    const data = await reorderListCards(listId, body.cardIds);
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
    console.error("[PATCH /api/lists/[listId]/cards/positions]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

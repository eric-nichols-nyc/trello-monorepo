import { NextResponse } from "next/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { patchCard } from "@/lib/api/cards/patch-card";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = await patchCard(cardId, body);
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
    console.error("[PATCH /api/cards/[cardId]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

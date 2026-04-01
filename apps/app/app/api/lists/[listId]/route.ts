/**
 * `PATCH` / `DELETE` `/api/lists/:listId` — Next proxy to Nest `ListsController`.
 */
import { NextResponse } from "next/server";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { deleteList } from "@/lib/api/lists/delete-list";
import { patchList } from "@/lib/api/lists/patch-list";

export async function PATCH(
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
    const data = await patchList(listId, body);
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
    console.error("[PATCH /api/lists/[listId]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ listId: string }> }
) {
  const { listId } = await context.params;

  try {
    const data = await deleteList(listId);
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
    console.error("[DELETE /api/lists/[listId]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

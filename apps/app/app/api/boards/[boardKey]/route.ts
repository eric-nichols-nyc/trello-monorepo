import { NextResponse } from "next/server";
import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { getBoard } from "@/lib/api/boards/get-board";

/**
 * Same-origin proxy for the Nest board detail endpoint.
 * Lets the browser (and TanStack Query) call `/api/boards/:boardKey` with cookies;
 * the handler attaches the Clerk session token and forwards to `API_URL`.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ boardKey: string }> }
) {
  const { boardKey } = await context.params;

  try {
    const data = await getBoard(boardKey);
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
    console.error("[GET /api/boards/[boardKey]]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

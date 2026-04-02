import { auth, clerkClient } from "@repo/clerk/server";
import { NextResponse } from "next/server";

/**
 * Deletes the signed-in Clerk user using the Backend API (no client reverification
 * modal). Trust is the Clerk session cookie / bearer on this request.
 */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
    return NextResponse.json({ ok: true as const });
  } catch (error) {
    console.error("[DELETE /api/account]", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

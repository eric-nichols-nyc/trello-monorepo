/**
 * Get a Clerk session JWT for testing (curl / Postman).
 *
 * Prereqs (same Clerk *application* as the Nest API uses):
 * 1. Dashboard → API Keys → copy the **Secret key** (`sk_test_...` / `sk_live_...`),
 *    not the publishable key (`pk_...`). Put it in `CLERK_SECRET_KEY`.
 * 2. Dashboard → Users → open a user → copy **User ID** (`user_...`) into `CLERK_USER_ID`.
 * 3. Dashboard → JWT templates → create a template named **default** (or set
 *    `CLERK_JWT_TEMPLATE` to your template’s short name).
 * 4. Run from `apps/api`: `pnpm get-token`
 *
 * If this prints **401**, the secret key is wrong, revoked, or from a different
 * Clerk instance than the user id.
 *
 * Browser token (while signed into the Next app): DevTools → Console:
 *   await window.Clerk?.session?.getToken()
 * (If `window.Clerk` is undefined, the app may not expose it; use this script instead.)
 */
import "dotenv/config";
import { createClerkClient, verifyToken } from "@clerk/backend";

function logClerkFailure(label: string, err: unknown): void {
  console.error(label);
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.status === "number") {
      console.error("HTTP status:", o.status);
    }
    if (Array.isArray(o.errors)) {
      console.error("Errors:", JSON.stringify(o.errors, null, 2));
    }
    if (o.clerkTraceId) {
      console.error("clerkTraceId:", o.clerkTraceId);
    }
  }
  console.error(err);
}

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function run() {
  const userId = process.env.CLERK_USER_ID?.trim();
  const template = process.env.CLERK_JWT_TEMPLATE ?? "default";
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is required in .env");
    process.exit(1);
  }
  if (!userId) {
    console.error(
      "CLERK_USER_ID is required in .env (Dashboard → Users → User ID, looks like user_...)"
    );
    process.exit(1);
  }

  let session: { id: string };
  try {
    session = await clerk.sessions.createSession({
      userId,
    });
  } catch (err) {
    logClerkFailure("Clerk API rejected createSession:", err);
    process.exit(1);
  }

  let response: unknown;
  try {
    response = await clerk.sessions.getToken(session.id, template);
  } catch (err) {
    logClerkFailure(
      "Clerk API rejected getToken (create a JWT template with this name in Dashboard → JWT templates):",
      err
    );
    process.exit(1);
  }
  const jwt =
    typeof response === "string"
      ? response
      : (response as { jwt?: string })?.jwt;
  if (!jwt) {
    console.error(
      "No JWT in response. Create a JWT template named '%s' in Clerk Dashboard → JWT templates.",
      template
    );
    console.error("Response:", response);
    process.exit(1);
  }

  try {
    const payload = await verifyToken(jwt, { secretKey });
    console.log(
      "Token verified. sub (user id):",
      (payload as { sub?: string })?.sub
    );
  } catch (err) {
    console.error(
      "Token verification failed (this is the error your API would return):"
    );
    console.error(err);
    process.exit(1);
  }

  console.log("\nToken (use in Authorization: Bearer <token>):");
  console.log(jwt);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

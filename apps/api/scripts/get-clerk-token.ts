/**
 * Get a Clerk session JWT for testing (e.g. Postman).
 *
 * 1. Create a JWT template in Clerk Dashboard → JWT templates, e.g. name "default".
 * 2. Set CLERK_SECRET_KEY and CLERK_USER_ID (a real user id from Clerk) in .env.
 * 3. Optional: CLERK_JWT_TEMPLATE=default (or your template name).
 * 4. Run: pnpm get-token
 * 5. Use the printed token as: Authorization: Bearer <token>
 */
import "dotenv/config";
import { createClerkClient, verifyToken } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

async function run() {
  const userId =
    process.env.CLERK_USER_ID ?? "user_3AeBqoeILoFdovPUTlE0rvg1sYX";
  const template = process.env.CLERK_JWT_TEMPLATE ?? "default";
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is required in .env");
    process.exit(1);
  }

  const session = await clerk.sessions.createSession({
    userId,
  });

  const response = await clerk.sessions.getToken(session.id, template);
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

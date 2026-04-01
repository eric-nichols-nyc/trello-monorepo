import { clerkMiddleware, createRouteMatcher } from "@repo/clerk/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/backend-health",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  if (userId && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/w", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

import { Suspense } from "react";
import { SignInPageClient } from "./sign-in-page-client";

function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 text-sm text-zinc-600">
      Loading…
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInPageClient />
    </Suspense>
  );
}

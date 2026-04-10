"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AuthPageShell } from "../../components/auth-page-shell";
import { LoginForm } from "../../components/auth-forms";
import { authClient } from "../../lib/auth-client";
import { resolvePostAuthPath } from "../../lib/workspace-home";

export function SignInPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      let cancelled = false;
      void (async () => {
        const path = await resolvePostAuthPath(next);
        if (!cancelled) {
          router.replace(path);
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [session, isPending, next, router]);

  if (isPending || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 text-sm text-zinc-600">
        Loading…
      </div>
    );
  }

  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Use your email and password to continue."
    >
      <LoginForm nextPath={next} />
    </AuthPageShell>
  );
}

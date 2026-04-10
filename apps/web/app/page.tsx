"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { resolvePostAuthPath } from "../lib/workspace-home";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending: isLoading } = authClient.useSession();

  useEffect(() => {
    if (!isLoading && session) {
      let cancelled = false;
      void (async () => {
        const path = await resolvePostAuthPath(null);
        if (!cancelled) {
          router.replace(path);
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-100 text-sm text-zinc-600">
        Loading…
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-100 text-sm text-zinc-600">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Welcome
        </h1>
        <p className="mt-3 text-zinc-600">
          Sign in to open your workspace, or create a new account.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-in"
            className="inline-flex justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

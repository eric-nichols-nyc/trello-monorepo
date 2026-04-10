"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../components/auth-provider";
import { authClient } from "../../lib/auth-client";
import { resolvePostAuthPath } from "../../lib/workspace-home";

export default function Workspace() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const path = await resolvePostAuthPath("/workspace");
      if (!cancelled && path !== "/workspace") {
        router.replace(path);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Workspace</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => authClient.signOut()}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <p>
            <strong>Email:</strong> {session.user?.email}
          </p>
          <p>
            <strong>Name:</strong> {session.user?.name}
          </p>
          <p>
            <strong>User ID:</strong> {session.user?.id}
          </p>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
          <p>
            This is a protected workspace page that only authenticated users can
            access.
          </p>
          <p className="mt-4 text-sm text-zinc-600">
            Try a short link:{" "}
            <Link
              href="/workspace/demo-link"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              /workspace/demo-link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

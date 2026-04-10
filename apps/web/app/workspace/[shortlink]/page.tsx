"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { authClient } from "../../../lib/auth-client";

export default function WorkspaceShortlinkPage() {
  const params = useParams();
  const raw = params.shortlink;
  const shortlink = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Short link</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Slug:{" "}
              <span className="font-mono text-zinc-900">{shortlink ?? "—"}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/workspace"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Workspace home
            </Link>
            <button
              type="button"
              onClick={() => authClient.signOut()}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">Destination</h2>
          <p className="text-zinc-700">
            You opened a protected workspace route. After signing in, you are
            redirected here from the URL you requested.
          </p>
        </div>
      </div>
    </div>
  );
}

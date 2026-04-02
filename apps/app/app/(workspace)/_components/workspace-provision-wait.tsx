"use client";

import { useClerk } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

/**
 * Props from `(workspace)/layout.tsx` after `getMyWorkspaces()` / Nest indicates the user
 * should not enter the main workspace shell yet.
 */
type WorkspaceProvisionWaitProps = {
  /**
   * - **`provisioning`**: Nest 404 (no `User` yet) or empty workspace list — webhook / sync delay.
   * - **`error`**: fetch failure, 5xx, missing `API_URL`, etc.
   */
  variant: "provisioning" | "error";
  /** Optional technical hint for `error` only; keep short — no raw API response bodies. */
  detail?: string;
};

/**
 * Full-screen blocking UI when workspace data is not available.
 * **Retry** re-runs the parent server layout (`router.refresh()` → `loadWorkspaceGateState` again).
 * **Sign out** clears Clerk and returns to `/sign-in` if the user is stuck.
 */
export function WorkspaceProvisionWait({
  variant,
  detail,
}: WorkspaceProvisionWaitProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [pending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);

  const handleRetry = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut({ redirectUrl: "/sign-in" });
    } catch {
      setSigningOut(false);
    }
  }, [signOut]);

  const isProvisioning = variant === "provisioning";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      {/* Copy + optional error detail */}
      <div className="max-w-md space-y-2">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {isProvisioning ? "Setting up your account" : "Couldn’t load your workspace"}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isProvisioning
            ? "Your account is still syncing. This usually takes a few seconds after sign-in. You can retry, or sign out and try again."
            : "We couldn’t reach the server or complete setup. Check your connection and try again."}
        </p>
        {!isProvisioning && detail ? (
          <p className="text-muted-foreground font-mono text-xs break-all opacity-80">
            {detail}
          </p>
        ) : null}
      </div>
      {/* Re-fetch server layout vs leave the broken session */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button disabled={pending} onClick={handleRetry} type="button">
          {pending ? "Retrying…" : "Retry"}
        </Button>
        <Button
          disabled={signingOut}
          onClick={() => {
            void handleSignOut();
          }}
          type="button"
          variant="outline"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}

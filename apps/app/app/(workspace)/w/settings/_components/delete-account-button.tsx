"use client";

import { useClerk, useUser } from "@repo/clerk/client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/design-system/components/ui/alert-dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { useCallback, useState } from "react";

/**
 * Deletes the account via `DELETE /api/account` (server uses Clerk Backend API).
 * Avoids client reverification, which requires configured auth factors and often
 * breaks in dev for OAuth-only test users.
 */
export function DeleteAccountButton() {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = useCallback((next: boolean) => {
    if (!pending) {
      setOpen(next);
      if (!next) {
        setError(null);
      }
    }
  }, [pending]);

  const handleDelete = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const body: unknown = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error: unknown }).error === "string"
            ? (body as { error: string }).error
            : "Could not delete your account";
        setError(message);
        return;
      }
      setOpen(false);
      // Avoid router.refresh / soft navigation: they can refetch /workspaces/mine
      // while the JWT is still valid and the user.deleted webhook has already
      // removed the Prisma row → Nest 404 "User not found after authentication".
      try {
        await signOut({ redirectUrl: "/sign-in" });
      } catch {
        window.location.replace("/sign-in");
      }
    } catch {
      setError("Could not delete your account");
    } finally {
      setPending(false);
    }
  }, [signOut]);

  const disabled = !isLoaded || !user;

  return (
    <div className="space-y-2">
      <Button
        disabled={disabled}
        onClick={() => {
          setOpen(true);
        }}
        type="button"
        variant="destructive"
      >
        Delete account
      </Button>

      <AlertDialog onOpenChange={handleOpenChange} open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your Clerk account and signs you out. This
              cannot be undone. Your backend should remove app data when it receives
              Clerk&apos;s user deleted webhook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending} type="button">
              Cancel
            </AlertDialogCancel>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={pending}
              onClick={() => {
                void handleDelete();
              }}
              type="button"
              variant="destructive"
            >
              {pending ? "Deleting…" : "Delete my account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

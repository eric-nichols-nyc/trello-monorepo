"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { TriangleAlert } from "lucide-react";

/**
 * Stub only — wire-up checklist:
 *
 * **Delete workspace (keep Clerk user)**
 * - Add Nest endpoint, e.g. `DELETE /api/workspaces/:id`, guarded so only `ownerId`
 *   matches the authenticated user.
 * - Prisma `workspace.delete` already exists in `WorkspacesService.remove`; ensure
 *   cascade rules match product (boards under that workspace go away per schema).
 * - From the app: call with Clerk session token (same pattern as other Nest clients).
 *
 * **Delete account (Clerk user + DB)**
 * - Must run on the server with `CLERK_SECRET_KEY`: Clerk Backend API
 *   `users.deleteUser(clerkUserId)` (or equivalent SDK call).
 * - Then either rely on `user.deleted` webhook to run `deleteUserByClerkId`, or
 *   delete the Prisma user immediately after Clerk succeeds (idempotent with webhook).
 * - Client: sign out + redirect after success.
 */
export function SettingsAccountActions() {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Destructive actions for this workspace and your account. Nothing here calls
          the API yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert variant="destructive">
          <TriangleAlert aria-hidden />
          <AlertTitle>Irreversible</AlertTitle>
          <AlertDescription>
            Deleting a workspace removes its boards and data from our database.
            Deleting your account removes you from Clerk and should remove your user
            row (and cascaded data) via the same flow.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div>
            <h3 className="font-medium text-foreground text-sm">
              Delete this workspace
            </h3>
            <p className="mt-1 text-muted-foreground text-xs">
              Stub: owner-only Nest delete; you stay signed in with other workspaces
              if any.
            </p>
          </div>
          <Button disabled type="button" variant="outline">
            Delete workspace (stub)
          </Button>
        </div>

        <div className="space-y-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
          <div>
            <h3 className="font-medium text-foreground text-sm">
              Delete your account
            </h3>
            <p className="mt-1 text-muted-foreground text-xs">
              Stub: Clerk user deletion + DB cleanup (webhook or synchronous after
              Clerk).
            </p>
          </div>
          <Button disabled type="button" variant="destructive">
            Delete account (stub)
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border pt-6">
        <p className="text-muted-foreground text-xs">
          Enable the buttons after the Nest + Clerk flows above are implemented.
        </p>
      </CardFooter>
    </Card>
  );
}

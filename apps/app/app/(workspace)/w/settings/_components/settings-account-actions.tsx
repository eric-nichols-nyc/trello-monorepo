"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@repo/design-system/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { TriangleAlert } from "lucide-react";

import { DeleteAccountButton } from "./delete-account-button";
import { DeleteWorkspaceButton } from "./delete-workspace-button";

/**
 * Danger-zone actions. Workspace delete is still a Nest stub; delete account
 * uses `DELETE /api/account` (Clerk Backend API on the server).
 */
export function SettingsAccountActions() {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Destructive actions for this workspace and your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert variant="destructive">
          <TriangleAlert aria-hidden />
          <AlertTitle>Irreversible</AlertTitle>
          <AlertDescription>
            Deleting a workspace removes its boards and data from our database.
            Deleting your account removes you from Clerk; ensure webhooks or jobs
            clean up your database row and cascades.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div>
            <h3 className="font-medium text-foreground text-sm">
              Delete this workspace
            </h3>
            <p className="mt-1 text-muted-foreground text-xs">
              Stub: owner-only Nest delete; you stay signed in with other
              workspaces if any.
            </p>
          </div>
          <DeleteWorkspaceButton />
        </div>

        <div className="space-y-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
          <div>
            <h3 className="font-medium text-foreground text-sm">
              Delete your account
            </h3>
            <p className="mt-1 text-muted-foreground text-xs">
              Calls a server route that deletes your Clerk user (Backend API),
              then sends you to sign-in. Requires a valid session.
            </p>
          </div>
          <DeleteAccountButton />
        </div>
      </CardContent>
      <CardFooter className="border-t border-border pt-6">
        <p className="text-muted-foreground text-xs">
          Workspace delete still needs a Nest endpoint. Account delete relies on
          Clerk and your backend sync.
        </p>
      </CardFooter>
    </Card>
  );
}

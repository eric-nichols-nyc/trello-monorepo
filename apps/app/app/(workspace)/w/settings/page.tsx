import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Separator } from "@repo/design-system/components/ui/separator";
import type { Metadata } from "next";
import Link from "next/link";

import { SettingsAccountActions } from "./_components/settings-account-actions";

export const metadata: Metadata = {
  title: "Settings",
};

export default function WorkspaceSettingsPage() {
  return (
    <div className="mx-auto max-w-[914px] space-y-8">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Workspace preferences and account controls.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Workspace profile and defaults will be edited here (name, short link,
            etc.). Not implemented yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          <p>
            Stub: load current workspace from route context or a workspace query;
            PATCH via Nest when you add `UpdateWorkspace` wiring from this screen.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <SettingsAccountActions />

      <Button asChild variant="outline">
        <Link href="/w">Back to boards</Link>
      </Button>
    </div>
  );
}

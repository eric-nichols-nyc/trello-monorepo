import { Button } from "@repo/design-system/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings",
};

export default function WorkspaceSettingsPage() {
  return (
    <div className="mx-auto max-w-[914px] space-y-4">
      <h1 className="font-semibold text-2xl text-foreground">Settings</h1>
      <p className="text-muted-foreground text-sm">
        Workspace preferences and configuration will live here. This page is a
        placeholder for now.
      </p>
      <Button asChild variant="outline">
        <Link href="/w">Back to boards</Link>
      </Button>
    </div>
  );
}

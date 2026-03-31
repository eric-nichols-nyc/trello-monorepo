import { Button } from "@repo/design-system/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Members",
};

export default function WorkspaceMembersPage() {
  return (
    <div className="mx-auto max-w-[914px] space-y-4">
      <h1 className="font-semibold text-2xl text-foreground">Members</h1>
      <p className="text-muted-foreground text-sm">
        Invite people and manage workspace access here. This screen is a
        placeholder until member management is wired up.
      </p>
      <Button asChild variant="outline">
        <Link href="/w">Back to boards</Link>
      </Button>
    </div>
  );
}

"use client";

import { Button } from "@repo/design-system/components/ui/button";

/** Owner-only Nest delete — not wired yet. */
export function DeleteWorkspaceButton() {
  return (
    <Button disabled type="button" variant="outline">
      Delete workspace (stub)
    </Button>
  );
}

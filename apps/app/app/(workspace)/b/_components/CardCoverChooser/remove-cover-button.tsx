"use client";

import { Button } from "@repo/design-system/components/ui/button";

/** Clears the card cover. Connect to API / mutation when ready. */
export function RemoveCoverButton() {
  return (
    <Button className="w-full" type="button" variant="destructive">
      Remove cover
    </Button>
  );
}

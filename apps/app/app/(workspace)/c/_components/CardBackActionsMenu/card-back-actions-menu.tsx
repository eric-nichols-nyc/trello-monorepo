"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { ChevronDown } from "lucide-react";

export type CardBackActionsMenuProps = {
  listName: string;
};

export function CardBackActionsMenu({ listName }: CardBackActionsMenuProps) {
  return (
    <Button
      className="gap-1 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      size="sm"
      type="button"
      variant="ghost"
    >
      {listName}
      <ChevronDown className="size-4" />
    </Button>
  );
}

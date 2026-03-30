"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

type AddCardButtonProps = {
  onSelect: () => void;
};

export function AddCardButton({ onSelect }: AddCardButtonProps) {
  return (
    <DropdownMenuItem
      onSelect={() => {
        onSelect();
      }}
    >
      <Plus aria-hidden className="size-4" strokeWidth={2} />
      Add card
    </DropdownMenuItem>
  );
}

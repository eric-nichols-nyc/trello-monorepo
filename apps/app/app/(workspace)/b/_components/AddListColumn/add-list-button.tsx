"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Plus } from "lucide-react";

export type AddListButtonProps = {
  onClick?: () => void;
};

/** Column-width control to open the “add list” flow (matches board list column width). */
export const AddListButton = ({ onClick }: AddListButtonProps) => (
  <Button
    className="h-11 w-[270px] shrink-0 justify-start border border-white/20 bg-white/15 font-bold text-white/95 shadow-sm backdrop-blur-xl backdrop-saturate-150 hover:border-white/30 hover:bg-white/25"
    onClick={onClick}
    type="button"
    variant="secondary"
  >
    <Plus aria-hidden className="size-4 shrink-0" />
    Add another list
  </Button>
);

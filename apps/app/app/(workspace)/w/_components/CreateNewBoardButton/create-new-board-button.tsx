"use client";

import { Button } from "@repo/design-system/components/ui/button";
import type { Ref } from "react";

type CreateNewBoardButtonProps = {
  readonly buttonRef?: Ref<HTMLButtonElement>;
  readonly onClick: () => void;
};

export function CreateNewBoardButton({
  buttonRef,
  onClick,
}: CreateNewBoardButtonProps) {
  return (
    <Button onClick={onClick} ref={buttonRef} type="button">
      Create your first board
    </Button>
  );
}

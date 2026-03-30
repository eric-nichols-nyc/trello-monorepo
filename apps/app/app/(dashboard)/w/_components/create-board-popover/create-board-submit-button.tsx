"use client";

import { Button } from "@repo/design-system/components/ui/button";

export type CreateBoardSubmitButtonProps = {
  readonly disabled: boolean;
  readonly pending?: boolean;
};

export function CreateBoardSubmitButton({
  disabled,
  pending = false,
}: CreateBoardSubmitButtonProps) {
  return (
    <Button className="w-full" disabled={disabled || pending} type="submit">
      {pending ? "Creating…" : "Create"}
    </Button>
  );
}

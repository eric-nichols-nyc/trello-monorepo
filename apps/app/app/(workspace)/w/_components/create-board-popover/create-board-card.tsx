"use client";

import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { CreateBoardForm } from "./create-board-form";
import { CreateBoardHeader } from "./create-board-header";

/** Used when anchoring the popover to the trigger button. */
export const CREATE_BOARD_CARD_WIDTH = 288;
/** Approximate height for popover anchor math in `empty-boards` (card uses auto height). */
export const CREATE_BOARD_POPOVER_LAYOUT_ESTIMATE_PX = 520;

export type CreateBoardCardProps = {
  readonly onClose: () => void;
  readonly workspaceId: string | null;
  readonly className?: string;
  readonly onCreated?: () => void;
};

export function CreateBoardCard({
  onClose,
  workspaceId,
  className,
  onCreated,
}: CreateBoardCardProps) {
  return (
    <Card
      className={cn(
        "flex h-auto max-h-[min(90dvh,720px)] flex-col gap-0 overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-muted p-0 py-0 text-foreground shadow-lg",
        className
      )}
      style={{
        width: CREATE_BOARD_CARD_WIDTH,
      }}
    >
      <CreateBoardHeader onClose={onClose} />
      <CardContent className="flex flex-col px-4 py-4">
        <CreateBoardForm onCreated={onCreated} workspaceId={workspaceId} />
      </CardContent>
    </Card>
  );
}

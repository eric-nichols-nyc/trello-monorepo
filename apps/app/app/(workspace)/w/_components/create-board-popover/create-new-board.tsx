"use client";

import { cn } from "@repo/design-system/lib/utils";

import { CreateBoardForm } from "./create-board-form";
import { CreateBoardHeader } from "./create-board-header";

export type CreateNewBoardProps = {
  readonly workspaceId: string | null;
  readonly onCreated?: () => void;
  readonly className?: string;
};

/**
 * Single container for the create-board flow: hero header + form.
 * Uses `--card-back-actions-menu-bg` so it matches the header Create popover surface.
 */
export function CreateNewBoard({
  workspaceId,
  onCreated,
  className,
}: CreateNewBoardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col bg-(--card-back-actions-menu-bg) text-foreground",
        className,
      )}
    >
      <CreateBoardHeader hideToolbar />
      <div className="px-4 py-4">
        <CreateBoardForm onCreated={onCreated} workspaceId={workspaceId} />
      </div>
    </div>
  );
}

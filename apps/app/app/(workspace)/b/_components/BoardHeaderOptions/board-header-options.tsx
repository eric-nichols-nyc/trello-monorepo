"use client";

import { useWorkspaceShellCurrentUserInitials } from "@/app/(workspace)/_components/workspace-shell-context";
import { Button } from "@repo/design-system/components/ui/button";
import { ListFilter, UserPlus, Users } from "lucide-react";
import { BoardHeaderStarButton } from "./board-header-star-button";
import { NameFacepileMember } from "./name-facepile-member";
import { ProfilePopup } from "../ProfilePopup";

export type BoardHeaderOptionsProps = {
  readonly boardId: string;
  readonly boardKey: string;
  readonly starred: boolean;
  readonly workspaceId: string;
};

/**
 * Board header toolbar: filter, star, members, share, and a facepile tile for the signed-in user.
 * Facepile initials: `useWorkspaceShellCurrentUserInitials()` (set in `(workspace)/layout` via `getCurrentUserInitialsFromApi`).
 */
export function BoardHeaderOptions({
  boardId,
  boardKey,
  starred,
}: BoardHeaderOptionsProps) {
  // Initials: server → `WorkspaceShellProvider` via `getCurrentUserInitialsFromApi` in `(workspace)/layout`.
  const currentUserInitials = useWorkspaceShellCurrentUserInitials();

  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <ProfilePopup
        initials={currentUserInitials}
        trigger={<NameFacepileMember initials={currentUserInitials} />}
      />
      <Button
        aria-label="Filter board"
        className="size-8 text-white/90 hover:bg-white/10 hover:text-white"
        size="icon"
        title="Coming soon"
        type="button"
        variant="ghost"
      >
        <ListFilter aria-hidden className="size-4" strokeWidth={2} />
      </Button>

      <BoardHeaderStarButton
        boardId={boardId}
        boardKey={boardKey}
        starred={starred}
      />

      <Button
        aria-label="Board members"
        className="size-8 text-white/90 hover:bg-white/10 hover:text-white"
        size="icon"
        title="Coming soon"
        type="button"
        variant="ghost"
      >
        <Users aria-hidden className="size-4" strokeWidth={2} />
      </Button>

      <Button
        aria-label="Share board"
        className="h-8 gap-1.5 rounded-md bg-[#1e293b] px-3 text-sm font-medium text-white hover:bg-[#0f172a] sm:px-3.5"
        title="Coming soon"
        type="button"
        variant="ghost"
      >
        <UserPlus aria-hidden className="size-4 shrink-0" strokeWidth={2} />
        Share
      </Button>
    </div>
  );
}

import { ChevronsUp } from "lucide-react";

export type NameFacepileMemberProps = {
  /** Usually from `useWorkspaceShellCurrentUserInitials()` (server-derived via Nest `User`). */
  readonly initials: string;
};

/**
 * Presentational: workspace-style circle + chevron badge. No data fetching — wrap with `Link` or a button at the call site.
 */
export function NameFacepileMember({ initials }: NameFacepileMemberProps) {
  return (
    <span className="relative flex shrink-0">
      <span className="flex size-8 items-center justify-center rounded-full bg-[#4a6bfe] font-semibold text-[11px] text-white leading-none">
        {initials}
      </span>
      <span
        aria-hidden
        className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full border border-white/90 bg-white shadow-sm"
      >
        <ChevronsUp className="size-2.5 text-[#4a6bfe]" strokeWidth={2.5} />
      </span>
    </span>
  );
}

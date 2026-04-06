import Link from "next/link";
import { BrandWordmark } from "@/app/(marketing)/_components/brand-wordmark";
import {
  HeaderSearchBoardsPopover,
  type HeaderSearchWorkspaceSummary,
} from "../search/header-search-boards-popover";
import { UserMenu } from "../user/user-menu";
import { HeaderCreateStackedPopover } from "./header-create-stacked-popover";

type GlobalHeaderProperties = {
  readonly title?: string;
  /** Default workspace for header “Create board” (first of mine). */
  readonly workspaceId?: string | null;
  readonly initialBoards?: readonly unknown[];
  readonly workspaceSummaries?: readonly HeaderSearchWorkspaceSummary[];
};

export const GlobalHeader = ({
  title = "Dashboard",
  workspaceId = null,
  initialBoards = [],
  workspaceSummaries = [],
}: GlobalHeaderProperties) => (
  <header
    className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center gap-x-4 border-chrome-divider border-b bg-background px-8"
    data-testid="global-header"
  >
    <div className="flex min-w-0 justify-self-start">
      <Link
        aria-label={`${title} — workspace home`}
        className="flex shrink-0 items-center gap-2 rounded-md no-underline outline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        href="/w"
      >
        <BrandWordmark />
      </Link>
    </div>
    <div className="flex min-w-0 items-center gap-2">
      <div className="w-[min(780px,calc(100vw-18rem))] min-w-0 max-w-[780px]">
        <HeaderSearchBoardsPopover
          initialBoards={initialBoards}
          workspaceSummaries={workspaceSummaries}
        />
      </div>
      <HeaderCreateStackedPopover
        className="shrink-0"
        workspaceId={workspaceId}
      />
    </div>
    <div className="flex min-w-0 items-center justify-self-end gap-2">
      <UserMenu />
    </div>
  </header>
);

import {
  HeaderSearchBoardsPopover,
  type HeaderSearchWorkspaceSummary,
} from "../search/header-search-boards-popover";
import { UserMenu } from "../user/user-menu";
import { GlobalHeaderBrand } from "./global-header-brand";
import { HeaderCreateStackedPopover } from "./header-create-stacked-popover";
import { HeaderUtilityButtons } from "../header-utility-buttons/header-utility-buttons";

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
    className="flex min-h-14 min-w-0 w-full items-center justify-between gap-2 overflow-x-auto border-chrome-divider border-b bg-background px-2 sm:gap-3 sm:px-4 md:px-8"
    data-testid="global-header"
  >
    <div className="shrink-0">
      <GlobalHeaderBrand title={title} />
    </div>
    <div className="mx-2 flex min-w-0 max-w-2xl flex-1 items-center gap-2 sm:mx-4">
      <div className="min-w-0 flex-1">
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
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <HeaderUtilityButtons />
      <UserMenu />
    </div>
  </header>
);

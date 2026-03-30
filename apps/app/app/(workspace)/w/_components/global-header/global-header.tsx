import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import Link from "next/link";
import { HeaderSearchInput } from "../search/header-search-input";
import { UserMenu } from "../user/user-menu";
import { HeaderCreateStackedPopover } from "./header-create-stacked-popover";

type GlobalHeaderProperties = {
  readonly title?: string;
  /** Default workspace for header “Create board” (first of mine). */
  readonly workspaceId?: string | null;
};

export const GlobalHeader = ({
  title = "Dashboard",
  workspaceId = null,
}: GlobalHeaderProperties) => (
  <header
    className="flex min-h-14 items-center gap-4 border-chrome-divider border-b bg-background px-8"
    data-testid="global-header"
  >
    <Link
      className="shrink-0 rounded-md font-semibold text-base text-foreground no-underline outline-offset-2 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      href="/w"
    >
      <strong>{title}</strong>
    </Link>
    <div className="mx-auto flex min-w-0 max-w-[780px] flex-1 items-center gap-2">
      <HeaderSearchInput />
      <HeaderCreateStackedPopover
        className="shrink-0"
        workspaceId={workspaceId}
      />
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <UserMenu />
      <ModeToggle />
    </div>
  </header>
);

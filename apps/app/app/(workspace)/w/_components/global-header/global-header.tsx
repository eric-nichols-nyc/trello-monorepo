import Link from "next/link";
import { BrandWordmark } from "@/app/(marketing)/_components/brand-wordmark";
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
      aria-label={`${title} — workspace home`}
      className="flex shrink-0 items-center gap-2 rounded-md no-underline outline-offset-2 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      href="/w"
    >
      <BrandWordmark />
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
    </div>
  </header>
);

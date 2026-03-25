import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import Link from "next/link";
import { HeaderCreateButton } from "./search/header-create-button";
import { HeaderSearchInput } from "./search/header-search-input";
import { UserMenu } from "./user/user-menu";

type GlobalHeaderProperties = {
  readonly title?: string;
};

export const GlobalHeader = ({
  title = "Dashboard",
}: GlobalHeaderProperties) => (
  <header
    className="flex min-h-14 items-center gap-4 border-chrome-divider border-b bg-background px-8"
    data-testid="global-header"
  >
    <Link
      className="shrink-0 rounded-md font-semibold text-base text-foreground no-underline outline-offset-2 transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      href="/dashboard"
    >
      <strong>{title}</strong>
    </Link>
    <div className="mx-auto flex min-w-0 max-w-[780px] flex-1 items-center gap-2">
      <HeaderSearchInput />
      <HeaderCreateButton className="shrink-0" />
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <UserMenu />
      <ModeToggle />
    </div>
  </header>
);

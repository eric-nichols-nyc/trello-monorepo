import { ModeToggle } from "@repo/design-system/components/mode-toggle";
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
    className="flex min-h-14 items-center gap-4 border-border border-b bg-background px-8"
    data-testid="global-header"
  >
    <strong className="shrink-0 font-semibold text-base text-foreground">
      {title}
    </strong>
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

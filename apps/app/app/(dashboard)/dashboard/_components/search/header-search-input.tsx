import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";

type HeaderSearchInputProperties = Omit<
  ComponentProps<typeof Input>,
  "type"
> & {
  readonly containerClassName?: string;
};

export const HeaderSearchInput = ({
  className,
  containerClassName,
  placeholder = "Search",
  "aria-label": ariaLabel,
  ...properties
}: HeaderSearchInputProperties) => (
  <div
    className={cn("relative min-w-0 flex-1", containerClassName)}
    data-testid="header-search-input"
  >
    <Search
      aria-hidden
      className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
    />
    <Input
      aria-label={ariaLabel ?? placeholder}
      className={cn("h-9 pl-9", className)}
      placeholder={placeholder}
      type="search"
      {...properties}
    />
  </div>
);

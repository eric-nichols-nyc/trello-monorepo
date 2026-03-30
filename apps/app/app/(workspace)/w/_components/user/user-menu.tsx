"use client";

import { useClerk } from "@repo/clerk/client";
import {
  Avatar,
  AvatarFallback,
} from "@repo/design-system/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";

const placeholderUser = {
  initials: "EN",
  name: "Eric Nichols",
  email: "eric@example.com",
} as const;

type UserMenuProperties = {
  readonly className?: string;
  readonly email?: string;
  readonly initials?: string;
  readonly name?: string;
};

export const UserMenu = ({
  className,
  email = placeholderUser.email,
  initials = placeholderUser.initials,
  name = placeholderUser.name,
}: UserMenuProperties) => {
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          data-testid="user-menu-trigger"
          type="button"
        >
          <Avatar className="size-9">
            <AvatarFallback className="text-sm">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56" sideOffset={8}>
        <div
          className="flex items-center gap-3 px-2 py-2"
          data-testid="user-menu-row-name"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-sm">
            {initials}
          </div>
          <span className="truncate font-medium text-foreground text-sm">
            {name}
          </span>
        </div>
        <div
          className="border-border border-t px-2 py-2 text-muted-foreground text-sm"
          data-testid="user-menu-row-email"
        >
          {email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="user-menu-logout"
          onSelect={() => {
            signOut();
          }}
          variant="destructive"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

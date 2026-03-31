"use client";

import { useEffect, useState } from "react";
import { useClerk, useUser } from "@repo/clerk/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { initialsFromPersonNameFields } from "@/lib/user/user-initials";

type UserMenuAvatarProperties = {
  readonly imageUrl: string | undefined;
  readonly initials: string;
  readonly isLoaded: boolean;
};

const UserMenuAvatar = ({
  imageUrl,
  initials,
  isLoaded,
}: UserMenuAvatarProperties) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const showPhoto = Boolean(imageUrl) && !imageFailed;

  return (
    <div className="relative flex size-9 shrink-0 overflow-hidden rounded-full bg-muted">
      {showPhoto ? (
        <img
          alt=""
          className="aspect-square size-full object-cover"
          onError={() => {
            setImageFailed(true);
          }}
          referrerPolicy="no-referrer"
          src={imageUrl}
        />
      ) : (
        <span className="flex size-full items-center justify-center font-medium text-muted-foreground text-sm">
          {isLoaded ? initials : "…"}
        </span>
      )}
    </div>
  );
};

type UserMenuProperties = {
  readonly className?: string;
};

export const UserMenu = ({ className }: UserMenuProperties) => {
  const { signOut } = useClerk();
  const { isLoaded, user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    email ||
    "Account";
  const imageUrl = user?.imageUrl;
  const initials = initialsFromPersonNameFields({
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName,
    email,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={
            isLoaded ? `Open account menu for ${name}` : "Account menu"
          }
          className={cn(
            "rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          data-testid="user-menu-trigger"
          disabled={!isLoaded}
          type="button"
        >
          <UserMenuAvatar
            imageUrl={imageUrl}
            initials={initials}
            isLoaded={isLoaded}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-56 bg-[var(--board-menu-card-bg)]"
        sideOffset={8}
      >
        <div
          className="flex items-center gap-3 px-2 py-2"
          data-testid="user-menu-row-name"
        >
          <UserMenuAvatar
            imageUrl={imageUrl}
            initials={initials}
            isLoaded={isLoaded}
          />
          <span className="truncate font-medium text-foreground text-sm">
            {isLoaded ? name : "…"}
          </span>
        </div>
        <div
          className="border-border border-t px-2 py-2 text-muted-foreground text-sm"
          data-testid="user-menu-row-email"
        >
          {isLoaded ? email : "…"}
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

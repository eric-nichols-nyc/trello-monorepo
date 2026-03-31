"use client";

import { useEffect, useState } from "react";
import { useClerk, useUser } from "@repo/clerk/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { initialsFromPersonNameFields } from "@/lib/user/user-initials";

type UserMenuAvatarProperties = {
  readonly className?: string;
  readonly imageUrl: string | undefined;
  readonly initials: string;
  readonly initialsSurfaceClassName?: string;
  readonly initialsTextClassName?: string;
  readonly isLoaded: boolean;
};

const UserMenuAvatar = ({
  className,
  imageUrl,
  initials,
  initialsSurfaceClassName,
  initialsTextClassName,
  isLoaded,
}: UserMenuAvatarProperties) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const showPhoto = Boolean(imageUrl) && !imageFailed;
  const surface = showPhoto
    ? "bg-muted"
    : (initialsSurfaceClassName ?? "bg-muted");
  const initialsText =
    initialsTextClassName ?? "font-medium text-muted-foreground text-sm";

  return (
    <div
      className={cn(
        "relative flex size-9 shrink-0 overflow-hidden rounded-full",
        surface,
        className
      )}
    >
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
        <span
          className={cn(
            "flex size-full items-center justify-center",
            initialsText
          )}
        >
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
        className="box-border w-[var(--user-menu-card-width)] max-w-[var(--user-menu-card-width)] bg-[var(--board-menu-card-bg)]"
        sideOffset={8}
      >
        <div
          className="flex items-center gap-3 border-b border-white/10 px-[var(--board-menu-card-padding-inline)] py-3"
          data-testid="user-menu-profile"
        >
          <UserMenuAvatar
            className="size-10"
            imageUrl={imageUrl}
            initials={initials}
            initialsSurfaceClassName="bg-[#0c66e4]"
            initialsTextClassName="font-semibold text-sm text-white"
            isLoaded={isLoaded}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
              className="truncate font-medium text-sm text-white/90"
              data-testid="user-menu-row-name"
            >
              {isLoaded ? name : "…"}
            </span>
            <span
              className="truncate text-white/55 text-xs"
              data-testid="user-menu-row-email"
            >
              {isLoaded ? email : "…"}
            </span>
          </div>
        </div>
        <DropdownMenuItem
          className="text-white focus:bg-white/10 focus:text-white"
          data-testid="user-menu-logout"
          onSelect={() => {
            signOut();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

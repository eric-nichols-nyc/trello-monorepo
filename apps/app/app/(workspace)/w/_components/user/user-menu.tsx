"use client";

import { useEffect, useState } from "react";
import { useClerk, useUser } from "@repo/clerk/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { CircleHelp, Keyboard, Users } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { initialsFromPersonNameFields } from "@/lib/user/user-initials";

const menuItemClass =
  "text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white focus:bg-white/10 focus:text-white [&_svg:not([class*='text-'])]:text-white/70";

const themeSubTriggerClass = cn(
  menuItemClass,
  "border-l-4 border-transparent pl-1.5 data-[state=open]:border-[#0c66e4] data-[state=open]:bg-white/[0.06] data-[state=open]:text-[#0c66e4]"
);

const themeSubPanelClass =
  "min-w-[240px] border border-white/10 bg-[var(--board-menu-card-bg)] p-1 text-white shadow-lg";

const themeRadioItemClass = cn(
  "border-l-[3px] border-transparent text-white",
  "data-[state=checked]:border-[#0c66e4] data-[state=checked]:bg-white/10 data-[state=checked]:text-[#0c66e4]",
  "data-[highlighted]:bg-white/10 data-[highlighted]:text-white",
  "data-[state=checked]:data-[highlighted]:bg-white/10 data-[state=checked]:data-[highlighted]:text-[#0c66e4]"
);

type ThemePreviewKind = "dark" | "light" | "system";

function ThemePreview({ kind }: { readonly kind: ThemePreviewKind }) {
  const frame =
    "size-7 shrink-0 overflow-hidden rounded border border-white/25 bg-black/20";
  if (kind === "light") {
    return <div aria-hidden className={cn(frame, "bg-zinc-100")} />;
  }
  if (kind === "dark") {
    return <div aria-hidden className={cn(frame, "bg-zinc-800")} />;
  }
  return (
    <div aria-hidden className={cn(frame, "flex")}>
      <div className="h-full w-1/2 bg-zinc-100" />
      <div className="h-full w-1/2 bg-zinc-800" />
    </div>
  );
}

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
  const { setTheme, theme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

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

  const themeValue = themeMounted ? (theme ?? "system") : "system";

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

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={themeSubTriggerClass}
            data-testid="user-menu-theme-trigger"
          >
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            alignOffset={-4}
            className={themeSubPanelClass}
            side="left"
            sideOffset={8}
          >
            <DropdownMenuRadioGroup
              onValueChange={(v) => {
                setTheme(v);
              }}
              value={themeValue}
            >
              <DropdownMenuRadioItem
                className={themeRadioItemClass}
                value="light"
              >
                <div className="flex items-center gap-2.5">
                  <ThemePreview kind="light" />
                  <span>Light</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                className={themeRadioItemClass}
                value="dark"
              >
                <div className="flex items-center gap-2.5">
                  <ThemePreview kind="dark" />
                  <span>Dark</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                className={themeRadioItemClass}
                value="system"
              >
                <div className="flex items-center gap-2.5">
                  <ThemePreview kind="system" />
                  <span>Match system</span>
                </div>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="mx-0 my-1 h-px bg-white/10" />

        <DropdownMenuItem asChild className={menuItemClass}>
          <Link className="flex items-center gap-2" href="/w">
            <Users className="size-4" />
            Create workspace
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={menuItemClass}>
          <CircleHelp className="size-4" />
          Help
        </DropdownMenuItem>
        <DropdownMenuItem className={menuItemClass}>
          <Keyboard className="size-4" />
          Shortcuts
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-0 my-1 h-px bg-white/10" />

        <DropdownMenuItem
          className={menuItemClass}
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

"use client";

import { useUser } from "@repo/clerk/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type ProfilePopupProps = {
  readonly initials: string;
  readonly trigger: ReactNode;
  readonly className?: string;
};

function normalizeHandle(raw: string | null | undefined): string {
  if (!raw || raw.trim().length === 0) {
    return "@member";
  }
  const trimmed = raw.trim();
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function ProfilePopup({ initials, trigger, className }: ProfilePopupProps) {
  const [open, setOpen] = useState(false);
  const { isLoaded, user } = useUser();

  const displayName = useMemo(() => {
    if (!isLoaded) {
      return "Loading…";
    }
    const fromFullName = user?.fullName?.trim();
    if (fromFullName) {
      return fromFullName;
    }
    const fromSplit = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    if (fromSplit) {
      return fromSplit;
    }
    return "Member";
  }, [isLoaded, user?.firstName, user?.fullName, user?.lastName]);

  const displayHandle = useMemo(() => {
    if (!isLoaded) {
      return "@…";
    }
    const username = user?.username;
    if (username) {
      return normalizeHandle(username);
    }
    const emailPrefix = user?.primaryEmailAddress?.emailAddress?.split("@")[0];
    return normalizeHandle(emailPrefix);
  }, [isLoaded, user?.primaryEmailAddress?.emailAddress, user?.username]);

  return (
    <Popover modal={false} onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={isLoaded ? `Open profile for ${displayName}` : "Open profile"}
          className={cn(
            "rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-white/40",
            className
          )}
          type="button"
        >
          {trigger}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[300px] rounded-xl border border-white/10 bg-[#282a33] p-0 text-white shadow-2xl"
        sideOffset={8}
      >
        <div className="relative flex items-center gap-4 border-b border-white/10 bg-[#6ea4f5] px-6 py-5">
          <div className="flex size-[90px] shrink-0 items-center justify-center rounded-full bg-[#0b57d0] font-semibold text-4xl text-white leading-none">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[16px] text-[#111827]">{displayName}</p>
            <p className="truncate text-[12px] text-[#0f274f]">{displayHandle}</p>
          </div>
          <button
            aria-label="Close profile popup"
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md bg-transparent text-[#0f274f]"
            onClick={() => {
              setOpen(false);
            }}
            type="button"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          <button
            className="w-full rounded-md px-0 py-2 text-left font-medium text-[14px] text-white/80 transition-colors hover:text-white"
            type="button"
          >
            Edit profile info
          </button>
          <div className="my-3 h-px bg-white/15" />
          <button
            className="w-full rounded-md px-0 py-2 text-left font-medium text-[14px] text-white/80 transition-colors hover:text-white"
            type="button"
          >
            View member&apos;s board activity
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


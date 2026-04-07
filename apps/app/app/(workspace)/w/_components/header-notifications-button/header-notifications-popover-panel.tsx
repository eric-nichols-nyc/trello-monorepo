"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Label } from "@repo/design-system/components/ui/label";
import { Switch } from "@repo/design-system/components/ui/switch";
import { Bell, MoreVertical, Sparkles } from "lucide-react";
import { useId, useState } from "react";

export function HeaderNotificationsPopoverPanel() {
  const onlyUnreadId = useId();
  const [onlyUnread, setOnlyUnread] = useState(true);

  return (
    <div
      className="flex max-h-[min(480px,85dvh)] w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border border-chrome-divider bg-[var(--board-menu-card-bg)] text-white shadow-xl ring-1 ring-black/25"
      data-testid="header-notifications-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-chrome-divider border-b px-4 py-3">
        <h2 className="font-semibold text-base text-white">Notifications</h2>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Label
            className="cursor-pointer text-muted-foreground text-xs font-normal"
            htmlFor={onlyUnreadId}
          >
            Only show unread
          </Label>
          <Switch
            checked={onlyUnread}
            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            id={onlyUnreadId}
            onCheckedChange={setOnlyUnread}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Notification options"
                className="size-8 text-muted-foreground hover:bg-white/10 hover:text-white"
                size="icon"
                type="button"
                variant="ghost"
              >
                <MoreVertical aria-hidden className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem>Notification settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center gap-4 px-6 py-10">
        <div className="relative flex size-28 items-center justify-center rounded-full bg-white/5">
          <Sparkles
            aria-hidden
            className="-top-1 -right-1 absolute size-4 text-violet-400"
            strokeWidth={1.5}
          />
          <Sparkles
            aria-hidden
            className="-left-1 absolute top-2 size-3 text-violet-400/80"
            strokeWidth={1.5}
          />
          <Bell
            aria-hidden
            className="size-12 text-white/30"
            strokeWidth={1.25}
          />
        </div>
        <p className="text-center font-semibold text-sm text-white/90">
          {onlyUnread ? "No unread notifications" : "No notifications"}
        </p>
      </div>
    </div>
  );
}

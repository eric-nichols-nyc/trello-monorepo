"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { Bell } from "lucide-react";
import { useState } from "react";
import { HeaderNotificationsPopoverPanel } from "./header-notifications-popover-panel";

type HeaderNotificationsButtonProps = {
  readonly className?: string;
};

export function HeaderNotificationsButton({
  className,
}: HeaderNotificationsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover modal={false} onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Notifications"
          className={cn("text-muted-foreground", className)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Bell aria-hidden className="size-5" strokeWidth={2} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto border-0 bg-transparent p-0 shadow-none"
        sideOffset={8}
      >
        <HeaderNotificationsPopoverPanel />
      </PopoverContent>
    </Popover>
  );
}

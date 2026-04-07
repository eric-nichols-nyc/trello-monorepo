"use client";

import { cn } from "@repo/design-system/lib/utils";
import { HeaderAnnouncementsButton } from "../header-announcements-button/header-announcements-button";
import { HeaderHelpButton } from "../header-help-button/header-help-button";
import { HeaderNotificationsButton } from "../header-notifications-button/header-notifications-button";

type HeaderUtilityButtonsProps = {
  readonly className?: string;
};

export function HeaderUtilityButtons({ className }: HeaderUtilityButtonsProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      data-testid="header-utility-buttons"
    >
      <HeaderAnnouncementsButton />
      <HeaderNotificationsButton />
      <HeaderHelpButton />
    </div>
  );
}

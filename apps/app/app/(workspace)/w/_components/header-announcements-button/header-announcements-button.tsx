"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Megaphone } from "lucide-react";

type HeaderAnnouncementsButtonProps = {
  readonly className?: string;
};

export function HeaderAnnouncementsButton({
  className,
}: HeaderAnnouncementsButtonProps) {
  return (
    <Button
      aria-label="Announcements"
      className={cn("text-muted-foreground", className)}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Megaphone aria-hidden className="size-5" strokeWidth={2} />
    </Button>
  );
}

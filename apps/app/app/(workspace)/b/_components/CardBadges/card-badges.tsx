"use client";

import { DescriptionBadge } from "./description-badge";

/** Row of metadata badges below the card title (dates, attachments, etc.). */
export function CardBadges() {
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1">
      <DescriptionBadge />
    </div>
  );
}

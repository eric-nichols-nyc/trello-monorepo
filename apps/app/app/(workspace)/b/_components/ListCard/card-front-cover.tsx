"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { CSSProperties } from "react";

export type CardFrontCoverProps = {
  coverColor?: string | null;
  coverImage?: string | null;
  className?: string;
};

/**
 * List-card cover strip: image as `background-size: cover` (132px tall), else solid `coverColor` (64px).
 * Image covers get a dark top gradient so the card overflow trigger stays visible.
 * Returns `null` when neither is set.
 */
export function CardFrontCover({
  coverColor,
  coverImage,
  className,
}: CardFrontCoverProps) {
  const hasImage =
    coverImage != null && String(coverImage).trim().length > 0;
  const hasColor =
    coverColor != null && String(coverColor).trim().length > 0;

  if (!hasImage && !hasColor) {
    return null;
  }

  const style: CSSProperties =
    hasImage === true
      ? {
          backgroundImage: `url(${coverImage})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }
      : { backgroundColor: String(coverColor) };

  return (
    <div
      aria-hidden
      className={cn(
        "relative w-full shrink-0 overflow-hidden rounded-t-[8px] bg-zinc-600",
        hasImage ? "h-[132px]" : "h-16",
        className
      )}
    >
      <div className="absolute inset-0" style={style} />
      {hasImage ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-1 h-16",
            "bg-linear-to-b from-black/60 via-black/25 to-transparent"
          )}
        />
      ) : null}
    </div>
  );
}

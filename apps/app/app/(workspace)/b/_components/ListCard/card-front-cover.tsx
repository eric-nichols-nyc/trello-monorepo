"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { CSSProperties } from "react";

export type CardFrontCoverProps = {
  coverColor?: string | null;
  coverImage?: string | null;
  className?: string;
};

/**
 * List-card cover strip: image as `background-size: cover`, else solid `coverColor`.
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
        "h-16 w-full shrink-0 rounded-t-[8px] bg-zinc-600",
        className
      )}
      style={style}
    />
  );
}

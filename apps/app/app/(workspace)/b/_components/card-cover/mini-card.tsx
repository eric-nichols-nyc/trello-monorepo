"use client";

import { cn } from "@repo/design-system/lib/utils";
import type { CSSProperties } from "react";

/** Matches list-card `LIST_CARD_SURFACE_CLASSNAME` fill for a scaled-down preview. */
const MINI_CARD_SURFACE =
  "rounded-[8px] bg-[rgb(36,37,40)] text-left text-zinc-200 shadow-sm";

export type MiniCardProps = {
  /** Line shown in the body (truncated). @default "Card title" */
  readonly title?: string;
  /** Solid cover bar on top (CSS color, e.g. hex). */
  readonly coverColor?: string | null;
  /** Image cover on top (`background-image`); wins over `coverColor` when both are set. */
  readonly coverImageSrc?: string | null;
  /** Cover strip height. @default "short" */
  readonly coverSize?: "none" | "short" | "tall";
  readonly className?: string;
};

const coverHeights = {
  none: "",
  short: "h-5",
  tall: "h-8",
} as const;

/**
 * Compact card chrome preview for the cover chooser (and similar UIs).
 */
export function MiniCard({
  title = "Card title",
  coverColor = null,
  coverImageSrc = null,
  coverSize = "short",
  className,
}: MiniCardProps) {
  const hasImage = coverImageSrc !== null && coverImageSrc !== "";
  const hasColor = coverColor !== null && coverColor !== "";
  const showCover =
    coverSize !== "none" && (hasImage === true || hasColor === true);

  const coverStyle: CSSProperties =
    hasImage === true
      ? {
          backgroundImage: `url(${coverImageSrc})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }
      : { backgroundColor: coverColor ?? undefined };

  return (
    <div
      className={cn(
        "w-full max-w-[136px] overflow-hidden",
        MINI_CARD_SURFACE,
        className
      )}
    >
      {showCover ? (
        <div
          className={cn(
            "w-full shrink-0 rounded-t-[7px] bg-zinc-600",
            coverHeights[coverSize]
          )}
          style={coverStyle}
        />
      ) : null}
      <div
        className={cn(
          "min-h-[28px] px-2 py-1.5",
          showCover ? "rounded-b-[8px]" : "rounded-[8px]"
        )}
      >
        <p className="line-clamp-2 font-medium text-[11px] text-zinc-100 leading-tight">
          {title}
        </p>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@repo/design-system/lib/utils";
import { LayoutGrid } from "lucide-react";
import type { CSSProperties } from "react";

type HeaderSearchBoardHoverPreviewProperties = {
  readonly title: string;
  readonly subtitle?: string;
  readonly previewStyle: CSSProperties;
  readonly className?: string;
};

/**
 * Rich board preview for search rows; positioned near the pointer (fixed + portal).
 */
export const HeaderSearchBoardHoverPreview = ({
  title,
  subtitle,
  previewStyle,
  className,
}: HeaderSearchBoardHoverPreviewProperties) => (
  <div
    className={cn(
      "w-[min(288px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover p-3 shadow-xl",
      className,
    )}
  >
    <div className="flex gap-3">
      <div
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-black/10 ring-inset dark:bg-zinc-200/95 dark:ring-white/15"
      >
        <LayoutGrid
          className="size-5 shrink-0 text-[#0052CC]"
          strokeWidth={2}
        />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate font-semibold text-foreground text-sm leading-snug">
          {title}
        </p>
        {subtitle !== undefined ? (
          <p className="truncate text-muted-foreground text-xs leading-snug">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
    <div
      className="mt-3 aspect-16/10 w-full overflow-hidden rounded-lg bg-muted bg-center bg-cover ring-1 ring-black/10 ring-inset dark:ring-white/10"
      style={previewStyle}
    />
    <div className="mt-3 flex items-center gap-2 text-muted-foreground">
      <LayoutGrid
        aria-hidden
        className="size-4 shrink-0 text-[#0052CC]"
        strokeWidth={2}
      />
      <span className="text-xs">Trellnode</span>
    </div>
  </div>
);

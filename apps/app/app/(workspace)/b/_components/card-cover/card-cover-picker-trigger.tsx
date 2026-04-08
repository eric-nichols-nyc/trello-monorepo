"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ImagePlus } from "lucide-react";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { CardCoverPicker } from "./card-cover-picker";

/** Space from viewport left/right when clamping the docked panel. */
const VIEWPORT_MARGIN_PX = 16;
/** Matches {@link CardCoverPicker} `w-[min(...,320px)]`. */
const PANEL_MAX_WIDTH_PX = 320;

/**
 * Horizontal position for `position: fixed; left: …` on the portaled picker.
 *
 * 1. **`getBoundingClientRect().left`** — same coordinate system as `fixed`, so the
 *    panel’s left edge lines up with the trigger wrapper (the “Change cover” row).
 * 2. **Clamp** — if `rect.left` is too far right, the panel would overflow the viewport.
 *    We keep `left` between `[margin, viewportWidth - panelWidth - margin]` so the
 *    whole sheet stays visible (panel width ≈ `min(320, viewport - 2×margin)`).
 */
function clampedAnchorLeftPx(anchor: HTMLElement): number {
  const rect = anchor.getBoundingClientRect();
  const viewportW =
    typeof window !== "undefined" ? window.innerWidth : PANEL_MAX_WIDTH_PX;
  const panelW = Math.min(PANEL_MAX_WIDTH_PX, viewportW - VIEWPORT_MARGIN_PX * 2);
  const minLeft = VIEWPORT_MARGIN_PX;
  const maxLeft = viewportW - panelW - VIEWPORT_MARGIN_PX;
  return Math.min(Math.max(rect.left, minLeft), maxLeft);
}

export type CardCoverPickerTriggerProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  readonly boardKey: string;
  readonly cardId: string;
  /** @default "Change cover" */
  label?: string;
  /** Icon + label row (e.g. card overflow menu). @default false */
  showLabel?: boolean;
  /** Fires when the floating {@link CardCoverPicker} opens or closes. */
  onPickerOpenChange?: (open: boolean) => void;
  /** Passed to {@link CardCoverPicker} to toggle “Remove cover”. @default false */
  hasCover?: boolean;
  readonly coverColor?: string | null;
  readonly coverImage?: string | null;
};

/**
 * Button that toggles the bottom-docked {@link CardCoverPicker} in a portal.
 */
export function CardCoverPickerTrigger({
  boardKey,
  cardId,
  className,
  label = "Change cover",
  showLabel = false,
  onClick,
  onPickerOpenChange,
  onPointerDown,
  hasCover = false,
  coverColor = null,
  coverImage = null,
  ...props
}: CardCoverPickerTriggerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  /** Measured from this wrapper so alignment follows the menu row, not just the icon button. */
  const anchorReference = useRef<HTMLDivElement>(null);
  /** Viewport X passed to {@link CardCoverPicker} as `style.left` (see `clampedAnchorLeftPx`). */
  const [anchorLeft, setAnchorLeft] = useState(0);

  const updateAnchorLeft = useCallback(() => {
    const node = anchorReference.current;
    if (!node) {
      return;
    }
    setAnchorLeft(clampedAnchorLeftPx(node));
  }, []);

  // Sync before paint when opening so the first frame already matches the anchor (no flicker).
  useLayoutEffect(() => {
    if (!pickerOpen) {
      return;
    }
    updateAnchorLeft();
  }, [pickerOpen, updateAnchorLeft]);

  // Board columns and the dropdown menu scroll; `capture: true` catches nested scrollers too.
  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    const handle = () => updateAnchorLeft();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [pickerOpen, updateAnchorLeft]);

  const togglePicker = useCallback(() => {
    setPickerOpen((prev) => {
      const next = !prev;
      onPickerOpenChange?.(next);
      return next;
    });
  }, [onPickerOpenChange]);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
    onPickerOpenChange?.(false);
  }, [onPickerOpenChange]);

  const pickerPortal =
    pickerOpen && typeof document !== "undefined"
      ? createPortal(
          <CardCoverPicker
            anchorLeft={anchorLeft}
            boardKey={boardKey}
            cardId={cardId}
            coverColor={coverColor}
            coverImage={coverImage}
            hasCover={hasCover}
            ignorePointerOutsideRef={anchorReference}
            onClose={closePicker}
          />,
          document.body
        )
      : null;

  return (
    <div
      className={cn(showLabel ? "relative w-full" : "relative inline-flex")}
      ref={anchorReference}
    >
      <Button
        aria-expanded={pickerOpen}
        aria-label={label}
        className={cn(
          showLabel === true
            ? "h-auto min-h-8 w-full justify-start gap-2 px-2 py-1.5 font-normal text-sm"
            : false,
          className
        )}
        size={showLabel === true ? "sm" : "icon-sm"}
        type="button"
        variant="ghost"
        {...(showLabel === true ? {} : { title: label })}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          togglePicker();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          event.stopPropagation();
        }}
      >
        <ImagePlus
          aria-hidden
          className={cn(
            "size-4 shrink-0",
            showLabel === true ? "text-muted-foreground" : false
          )}
          strokeWidth={2}
        />
        {showLabel === true ? (
          <span className="min-w-0 truncate">{label}</span>
        ) : null}
      </Button>
      {pickerPortal}
    </div>
  );
}

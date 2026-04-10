"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { ImagePlus } from "lucide-react";
import {
  type ComponentProps,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { computePortalAnchorPosition } from "@/lib/ui/portal-panel-viewport";

import {
  CARD_COVER_PICKER_ATTR,
  type CardCoverPickerAnchorViewport,
} from "./card-cover-picker-dom";

const LazyCardCoverPicker = lazy(async () => {
  const { CardCoverPicker } = await import("./card-cover-picker");
  return { default: CardCoverPicker };
});

/** Matches {@link CardCoverPicker} `w-[min(...,320px)]`. */
const PANEL_MAX_WIDTH_PX = 320;

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
 * Button that toggles the {@link CardCoverPicker} in a portal (anchored under the
 * trigger, clamped to the viewport — same pattern as edit-dates / copy-card).
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
  const [pickerPlacement, setPickerPlacement] = useState<{
    position: { left: number; top: number };
    anchorViewport: CardCoverPickerAnchorViewport;
  }>(() => ({
    position: { left: 0, top: 0 },
    anchorViewport: { top: 0, bottom: 0, left: 0, right: 0 },
  }));

  const updatePickerPlacement = useCallback(() => {
    const node = anchorReference.current;
    if (!node) {
      return;
    }
    setPickerPlacement(
      computePortalAnchorPosition(node, PANEL_MAX_WIDTH_PX)
    );
  }, []);

  // Sync before paint when opening so the first frame already matches the anchor (no flicker).
  useLayoutEffect(() => {
    if (!pickerOpen) {
      return;
    }
    updatePickerPlacement();
  }, [pickerOpen, updatePickerPlacement]);

  // Board columns and the dropdown menu scroll; `capture: true` catches nested scrollers too.
  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    const handle = () => updatePickerPlacement();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [pickerOpen, updatePickerPlacement]);

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
          <Suspense
            fallback={
              <output
                aria-live="polite"
                className={cn(
                  "fixed z-200 flex h-48 w-[min(100vw-2rem,320px)] max-h-[min(100dvh-2rem,100vh-2rem)] items-center justify-center rounded-xl border border-zinc-600/80 bg-zinc-800 text-sm text-zinc-400 shadow-lg"
                )}
                // Same marker as {@link CardCoverPicker} so overflow `onInteractOutside` ignores this shell.
                {...{ [CARD_COVER_PICKER_ATTR]: "" }}
                style={{
                  left: pickerPlacement.position.left,
                  top: pickerPlacement.position.top,
                }}
              >
                Loading cover options…
              </output>
            }
          >
            <LazyCardCoverPicker
              anchorViewport={pickerPlacement.anchorViewport}
              boardKey={boardKey}
              cardId={cardId}
              coverColor={coverColor}
              coverImage={coverImage}
              hasCover={hasCover}
              ignorePointerOutsideRef={anchorReference}
              onClose={closePicker}
              position={pickerPlacement.position}
            />
          </Suspense>,
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

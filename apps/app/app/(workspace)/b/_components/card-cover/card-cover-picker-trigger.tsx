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
 * Button that toggles the portaled {@link CardCoverPicker} anchored below this control.
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
  const anchorReference = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  const updatePickerPosition = useCallback(() => {
    const node = anchorReference.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    setPickerPosition({ top: rect.bottom + 4, left: rect.left });
  }, []);

  useLayoutEffect(() => {
    if (!pickerOpen) {
      return;
    }
    updatePickerPosition();
  }, [pickerOpen, updatePickerPosition]);

  useEffect(() => {
    if (!pickerOpen) {
      return;
    }
    const handle = () => updatePickerPosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [pickerOpen, updatePickerPosition]);

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
            boardKey={boardKey}
            cardId={cardId}
            coverColor={coverColor}
            coverImage={coverImage}
            hasCover={hasCover}
            ignorePointerOutsideRef={anchorReference}
            onClose={closePicker}
            position={pickerPosition}
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

"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { X } from "lucide-react";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

import { ColorCover } from "./color-cover";
import { CoverSize } from "./cover-size";
import { RemoveCoverButton } from "./remove-cover-button";
import { UnsplashCovers } from "./unsplash-covers";
import { Upload } from "./upload";
import { fitFixedPanelInViewport } from "@/lib/ui/portal-panel-viewport";

import {
  CARD_COVER_PICKER_ATTR,
  type CardCoverPickerAnchorViewport,
} from "./card-cover-picker-dom";

export type CardCoverPickerProps = {
  readonly boardKey: string;
  readonly cardId: string;
  /** Initial `top` / `left` from the trigger (`fixed` viewport px), before vertical fit. */
  readonly position: { top: number; left: number };
  /** Trigger bounds for flipping the panel above when there is not enough space below. */
  readonly anchorViewport: CardCoverPickerAnchorViewport;
  readonly onClose: () => void;
  /** Clicks on this node (e.g. the menu row trigger) must not count as “outside” the picker. */
  readonly ignorePointerOutsideRef?: RefObject<HTMLElement | null>;
  /** When true, show “Remove cover” (image and/or solid color). @default false */
  readonly hasCover?: boolean;
  readonly coverColor?: string | null;
  readonly coverImage?: string | null;
};

/**
 * Portal panel anchored under the menu row (like edit-dates / copy-card); repositions
 * to stay inside the viewport when content is tall or the trigger is near an edge.
 */
export function CardCoverPicker({
  boardKey,
  cardId,
  position,
  anchorViewport,
  onClose,
  ignorePointerOutsideRef,
  hasCover = false,
  coverColor = null,
  coverImage = null,
}: CardCoverPickerProps) {
  const rootReference = useRef<HTMLDivElement>(null);
  const [placedAt, setPlacedAt] = useState(() => position);

  useLayoutEffect(() => {
    const el = rootReference.current;
    if (!el) {
      return;
    }
    const apply = () => {
      setPlacedAt(fitFixedPanelInViewport({ el, position, anchorViewport }));
    };
    apply();
    const observer = new ResizeObserver(() => apply());
    observer.observe(el);
    return () => observer.disconnect();
  }, [position, anchorViewport]);

  useClickOutside(
    rootReference,
    onClose,
    true,
    // Keep menu trigger clickable without treating it as an outside click.
    ignorePointerOutsideRef ? [ignorePointerOutsideRef] : undefined
  );

  return (
    <div
      ref={rootReference}
      // data-card-cover-picker: see CARD_COVER_PICKER_ATTR
      {...{ [CARD_COVER_PICKER_ATTR]: "" }}
      aria-label="Choose card cover"
      aria-modal="true"
      className={cn(
        "fixed z-200 flex w-[min(100vw-2rem,320px)] max-h-[min(100dvh-2rem,100vh-2rem)] select-text flex-col overflow-hidden rounded-xl border border-zinc-600/80 bg-zinc-800 text-zinc-100 shadow-lg"
      )}
      onPointerDown={(event) => event.stopPropagation()}
      role="dialog"
      style={{ left: placedAt.left, top: placedAt.top }}
    >
      <Card
        className={cn(
          "flex min-h-0 max-h-full flex-1 flex-col gap-0 overflow-hidden rounded-none border-0 bg-transparent py-0 text-inherit shadow-none"
        )}
      >
        <div className="relative flex shrink-0 items-center justify-center border-zinc-600/80 border-b px-10 py-3">
          <CardTitle className="text-center font-semibold text-base text-zinc-100">
            Cover
          </CardTitle>
          <Button
            aria-label="Close"
            className={cn(
              "-translate-y-1/2 absolute top-1/2 right-1.5 size-8 shrink-0 rounded-md",
              "text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100",
              "focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/80"
            )}
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X aria-hidden className="size-4" />
          </Button>
        </div>
        <CardContent className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-y-contain px-4 pt-3 pb-4">
          <CoverSize />
          {hasCover ? (
            <RemoveCoverButton
              boardKey={boardKey}
              cardId={cardId}
              onApplied={onClose}
            />
          ) : null}
          <ColorCover
            boardKey={boardKey}
            cardId={cardId}
            coverColor={coverColor}
            coverImage={coverImage}
            onApplied={onClose}
          />
          <UnsplashCovers />
          {/* Upload applies cover then calls onClose (same as this picker’s onClose). */}
          <Upload
            boardKey={boardKey}
            cardId={cardId}
            onApplied={onClose}
          />
        </CardContent>
      </Card>
    </div>
  );
}

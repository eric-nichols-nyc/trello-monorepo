"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { X } from "lucide-react";
import { type RefObject, useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

import { ColorCover } from "./color-cover";
import { RemoveCoverButton } from "./remove-cover-button";
import { UnsplashCover } from "./unsplash-cover";
import { Upload } from "./upload";

export const CARD_COVER_PANEL_ATTR = "data-card-cover-panel";

export function isWithinCardCoverPanel(target: EventTarget | null): boolean {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(`[${CARD_COVER_PANEL_ATTR}]`) !== null
  );
}

export type CardCoverPanelProps = {
  readonly position: { left: number; top: number };
  readonly onClose: () => void;
  readonly ignorePointerOutsideRef?: RefObject<HTMLElement | null>;
};

export function CardCoverPanel({
  position,
  onClose,
  ignorePointerOutsideRef,
}: CardCoverPanelProps) {
  const panelReference = useRef<HTMLDivElement>(null);

  useClickOutside(
    panelReference,
    onClose,
    true,
    ignorePointerOutsideRef ? [ignorePointerOutsideRef] : undefined
  );

  return (
    <div
      ref={panelReference}
      {...{ [CARD_COVER_PANEL_ATTR]: "" }}
      aria-label="Card cover"
      aria-modal="true"
      className={cn(
        "fixed z-200 flex w-[min(100vw-1rem,320px)] select-text flex-col rounded-xl border border-zinc-600/80 bg-zinc-800 text-zinc-100 shadow-lg"
      )}
      onPointerDown={(event) => event.stopPropagation()}
      role="dialog"
      style={{ left: position.left, top: position.top }}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden rounded-none border-0 bg-transparent py-0 text-inherit shadow-none"
        )}
      >
        <div className="relative flex items-center justify-center border-zinc-600/80 border-b px-10 py-3">
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
        <CardContent className="space-y-5 px-4 pt-3 pb-4">
          <div className="space-y-2">
            <p className="font-semibold text-xs text-zinc-400">Size</p>
            <p className="text-sm text-zinc-500 leading-snug">
              Choose how tall the cover appears on the card.
            </p>
          </div>
          <ColorCover />
          <UnsplashCover />
          <Upload />
          <RemoveCoverButton />
        </CardContent>
      </Card>
    </div>
  );
}

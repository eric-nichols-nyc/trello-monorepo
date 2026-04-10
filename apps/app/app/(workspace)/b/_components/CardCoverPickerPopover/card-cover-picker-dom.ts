/**
 * DOM helpers for the portaled cover picker. Kept free of React UI so callers (e.g.
 * overflow menu) don’t eagerly load the lazy `card-cover-picker` chunk.
 */
import type { AnchorViewportRect } from "@/lib/ui/portal-panel-viewport";

export type CardCoverPickerAnchorViewport = AnchorViewportRect;

export const CARD_COVER_PICKER_ATTR = "data-card-cover-picker";

/** True if `target` is inside the card-cover picker (including portaled subtree). */
export function isWithinCardCoverPicker(target: EventTarget | null): boolean {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(`[${CARD_COVER_PICKER_ATTR}]`) !== null
  );
}

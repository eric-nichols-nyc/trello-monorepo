/**
 * DOM helpers for the portaled cover picker. Kept in a module with no UI imports so
 * callers (e.g. overflow menu) don’t eagerly load the lazy `card-cover-picker` chunk.
 */
export const CARD_COVER_PICKER_ATTR = "data-card-cover-picker";

/** True if `target` is inside the card-cover picker (including portaled subtree). */
export function isWithinCardCoverPicker(target: EventTarget | null): boolean {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(`[${CARD_COVER_PICKER_ATTR}]`) !== null
  );
}

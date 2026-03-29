"use client";

/**
 * Placeholder for choosing a solid color as the card cover.
 * Wire a swatch grid or color picker here later.
 */
export function ColorCover() {
  return (
    <div className="space-y-2">
      <p className="font-semibold text-xs text-zinc-400">Color</p>
      <p className="text-sm text-zinc-500 leading-snug">
        Set a solid color across the top of the card. Picking and saving will
        connect to the board API when that flow exists.
      </p>
    </div>
  );
}

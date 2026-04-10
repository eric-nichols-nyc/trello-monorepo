/**
 * Shared placement for portaled `position: fixed` panels (cover picker, copy card, etc.).
 */

export const VIEWPORT_MARGIN_PX = 16;
export const ANCHOR_GAP_PX = 4;

export type AnchorViewportRect = {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
};

/**
 * Initial placement: below the anchor, horizontal clamp using {@link panelMaxWidthPx}.
 */
export function computePortalAnchorPosition(
  anchor: HTMLElement,
  panelMaxWidthPx: number
): {
  position: { top: number; left: number };
  anchorViewport: AnchorViewportRect;
} {
  const rect = anchor.getBoundingClientRect();
  const vw =
    typeof window !== "undefined" ? window.innerWidth : panelMaxWidthPx;
  const panelW = Math.min(panelMaxWidthPx, vw - VIEWPORT_MARGIN_PX * 2);
  const minLeft = VIEWPORT_MARGIN_PX;
  const maxLeft = vw - panelW - VIEWPORT_MARGIN_PX;
  const left = Math.min(Math.max(rect.left, minLeft), maxLeft);
  const top = rect.bottom + ANCHOR_GAP_PX;
  return {
    position: { left, top },
    anchorViewport: {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    },
  };
}

/** Nudge `top` / `left` so the measured panel stays inside the viewport (flip above when needed). */
export function fitFixedPanelInViewport(args: {
  el: HTMLElement;
  position: { top: number; left: number };
  anchorViewport: AnchorViewportRect;
}): { top: number; left: number } {
  const { el, position, anchorViewport } = args;
  const box = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = VIEWPORT_MARGIN_PX;
  const gap = ANCHOR_GAP_PX;

  let top = position.top;
  if (top + box.height > vh - margin) {
    const above = anchorViewport.top - gap - box.height;
    if (above >= margin) {
      top = above;
    } else {
      top = Math.max(margin, vh - margin - box.height);
    }
  }

  let left = position.left;
  if (left + box.width > vw - margin) {
    left = vw - margin - box.width;
  }
  if (left < margin) {
    left = margin;
  }

  return { top, left };
}

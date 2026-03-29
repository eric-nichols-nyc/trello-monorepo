"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CREATE_BOARD_CARD_WIDTH,
  CREATE_BOARD_POPOVER_LAYOUT_ESTIMATE_PX,
  CreateBoardCard,
} from "../create-board-popover/create-board-card";

/** Horizontal offset from the trigger’s right edge (LTR); positive moves the card right. */
const POPOVER_OFFSET_X = 8;
/**
 * Fraction of card height above the trigger’s vertical center (lower = card sits lower).
 * 0.75 was too aggressive for mid-page buttons and clamped the popover to the viewport top.
 */
const POPOVER_VERTICAL_ANCHOR = 0.52;
/**
 * Extra vertical nudge in px (positive moves the card down).
 */
const POPOVER_OFFSET_Y = 48;

function getPopoverPosition(
  rect: DOMRect,
  offsetX: number,
  offsetY: number
): { top: number; left: number } {
  const left = rect.right + offsetX;
  const top =
    rect.top +
    rect.height / 2 -
    POPOVER_VERTICAL_ANCHOR * CREATE_BOARD_POPOVER_LAYOUT_ESTIMATE_PX +
    offsetY;
  const margin = 8;
  const maxLeft = Math.max(
    margin,
    window.innerWidth - CREATE_BOARD_CARD_WIDTH - margin
  );
  const maxTop = Math.max(
    margin,
    window.innerHeight - CREATE_BOARD_POPOVER_LAYOUT_ESTIMATE_PX - margin
  );
  return {
    left: Math.min(Math.max(margin, left), maxLeft),
    top: Math.min(Math.max(margin, top), maxTop),
  };
}

export function EmptyBoards() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const triggerReference = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePopoverPosition = useCallback(() => {
    const node = triggerReference.current;
    if (!node) {
      return;
    }
    setPopoverPosition(
      getPopoverPosition(
        node.getBoundingClientRect(),
        POPOVER_OFFSET_X,
        POPOVER_OFFSET_Y
      )
    );
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const openPopover = useCallback(() => {
    updatePopoverPosition();
    setOpen(true);
  }, [updatePopoverPosition]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    updatePopoverPosition();
  }, [open, updatePopoverPosition]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handle = () => updatePopoverPosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [open, updatePopoverPosition]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const portal =
    mounted && open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-50">
            <button
              aria-label="Close dialog"
              className="absolute inset-0 bg-black/40"
              onClick={close}
              type="button"
            />
            <div
              aria-labelledby="create-board-title"
              aria-modal="true"
              className="pointer-events-none fixed z-10 outline-none"
              role="dialog"
              style={{
                top: popoverPosition.top,
                left: popoverPosition.left,
              }}
            >
              <div className="pointer-events-auto">
                <CreateBoardCard onClose={close} />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <section
        aria-labelledby="empty-boards-heading"
        className="flex flex-col items-center justify-center rounded-lg border border-chrome-divider border-dashed bg-muted/20 px-6 py-16 text-center"
      >
        <h2
          className="mb-2 font-medium text-foreground text-lg"
          id="empty-boards-heading"
        >
          No boards yet
        </h2>
        <p className="mb-6 max-w-sm text-muted-foreground text-sm">
          Create a board to organize lists and cards for this workspace.
        </p>
        <Button onClick={openPopover} ref={triggerReference} type="button">
          Create your first board
        </Button>
      </section>
      {portal}
    </>
  );
}

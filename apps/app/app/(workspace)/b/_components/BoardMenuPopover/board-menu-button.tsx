"use client";

import { cn } from "@repo/design-system/lib/utils";
import { Ellipsis } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useClickOutside } from "@/hooks/use-click-outside";
import type { BoardBackgroundStyleSource } from "@/lib/board/get-board-background-style";

import { BoardMenuPopover } from "./board-menu-popover";

const BOARD_MENU_PANEL_Z = 200;

type BoardMenuButtonProps = {
  boardBackground: BoardBackgroundStyleSource;
  /** For `aria-label` / future analytics. */
  boardName: string;
  className?: string;
};

function placePanelNearTrigger(
  trigger: HTMLElement,
  panel: HTMLElement,
  verticalOffsetPx: number
) {
  const rect = trigger.getBoundingClientRect();
  const edgePadding = 8;
  /** Distance from viewport right edge to trigger’s right — matches Popover `align="end"`. */
  const insetFromRight = Math.max(0, window.innerWidth - rect.right);

  panel.style.position = "fixed";
  panel.style.top = `${rect.bottom + verticalOffsetPx}px`;
  panel.style.right = `${insetFromRight}px`;
  panel.style.left = "auto";
  panel.style.zIndex = String(BOARD_MENU_PANEL_Z);

  // If the panel is wider than space to the left of the trigger, nudge from the left edge.
  const panelRect = panel.getBoundingClientRect();
  if (panelRect.left < edgePadding) {
    panel.style.left = `${edgePadding}px`;
    panel.style.right = "auto";
  }
}

export function BoardMenuButton({
  boardBackground,
  boardName,
  className,
}: BoardMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, () => setOpen(false), open, [triggerRef]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!(trigger && panel)) {
      return;
    }

    const offset = 6;
    const update = () => {
      placePanelNearTrigger(trigger, panel, offset);
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Board menu: ${boardName}`}
        className={cn(
          "flex shrink-0 items-center justify-center rounded p-1 text-white/70 transition-colors",
          "hover:bg-white/10 hover:text-white",
          "focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/30",
          open ? "bg-white/10 text-white" : null,
          className
        )}
        onClick={() => setOpen((previous) => !previous)}
        ref={triggerRef}
        type="button"
      >
        <Ellipsis aria-hidden className="size-5 shrink-0" />
      </button>
      {open
        ? createPortal(
            <div
              className="pointer-events-auto w-max"
              onPointerDown={(event) => event.stopPropagation()}
              ref={panelRef}
            >
              <BoardMenuPopover
                boardBackground={boardBackground}
                boardName={boardName}
                onDismiss={() => setOpen(false)}
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}

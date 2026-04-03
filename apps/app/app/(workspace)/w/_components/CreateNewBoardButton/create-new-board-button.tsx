"use client";

import { Card } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
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

const POPOVER_OFFSET_X = 8;
const POPOVER_VERTICAL_ANCHOR = 0.52;
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

export type CreateNewBoardButtonProps = {
  readonly className?: string;
  readonly boardsRemaining?: number;
  readonly workspaceId: string | null;
};

export function CreateNewBoardButton({
  className,
  boardsRemaining = 3,
  workspaceId,
}: CreateNewBoardButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const triggerReference = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
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
    const handle = () => {
      updatePopoverPosition();
    };
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
              className="absolute inset-0 bg-transparent"
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
                <CreateBoardCard
                  onClose={close}
                  onCreated={close}
                  workspaceId={workspaceId}
                />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerReference}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Create new board, ${boardsRemaining} remaining`}
        className={cn(
          "block w-full rounded-xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        onClick={openPopover}
        type="button"
      >
        <Card className="flex h-[120px] flex-col items-center justify-center gap-0.5 rounded-xl border border-black/15 bg-[#454545] py-0 shadow-sm transition-shadow hover:shadow-md dark:border-white/15 dark:bg-[#3d3d3d]">
          <span className="px-3 font-medium text-[15px] text-white leading-snug">
            Create new board
          </span>
          <span className="px-3 text-[13px] text-white/85 leading-snug">
            {boardsRemaining} remaining
          </span>
        </Card>
      </button>
      {portal}
    </>
  );
}

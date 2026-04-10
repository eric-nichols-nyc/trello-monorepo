"use client";

import { useAuth } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { fetchBoardDetailClient } from "@/lib/api/boards/fetch-board-detail-client";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

import { CopyCardPopover } from "./copy-card-popover";

export type CopyCardPopoverTriggerProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  readonly boardKey: string;
  readonly cardId: string;
  /** @default "Copy card" */
  label?: string;
  showLabel?: boolean;
  onPanelOpenChange?: (open: boolean) => void;
};

export function CopyCardPopoverTrigger({
  boardKey,
  cardId,
  className,
  label = "Copy card",
  showLabel = false,
  onClick,
  onPanelOpenChange,
  onPointerDown,
  ...props
}: CopyCardPopoverTriggerProps) {
  const { getToken } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const anchorReference = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

  const { data: board } = useQuery({
    queryKey: boardDetailQueryKey(boardKey),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return fetchBoardDetailClient(boardKey, token);
    },
    staleTime: 60 * 1000,
  });

  const updatePanelPosition = useCallback(() => {
    const node = anchorReference.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    setPanelPosition({ top: rect.bottom + 4, left: rect.left });
  }, []);

  useLayoutEffect(() => {
    if (!panelOpen) {
      return;
    }
    updatePanelPosition();
  }, [panelOpen, updatePanelPosition]);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }
    const handle = () => updatePanelPosition();
    window.addEventListener("scroll", handle, true);
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle, true);
      window.removeEventListener("resize", handle);
    };
  }, [panelOpen, updatePanelPosition]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    onPanelOpenChange?.(false);
  }, [onPanelOpenChange]);

  const togglePanel = useCallback(() => {
    if (board === undefined) {
      return;
    }
    setPanelOpen((prev) => {
      const next = !prev;
      onPanelOpenChange?.(next);
      return next;
    });
  }, [board, onPanelOpenChange]);

  const panel =
    panelOpen &&
    board !== undefined &&
    typeof document !== "undefined"
      ? createPortal(
          <CopyCardPopover
            key={cardId}
            board={board}
            boardKey={boardKey}
            cardId={cardId}
            ignorePointerOutsideRef={anchorReference}
            onClose={closePanel}
            position={panelPosition}
          />,
          document.body
        )
      : null;

  const disabled = board === undefined || props.disabled === true;

  return (
    <div
      className={cn(showLabel ? "relative w-full" : "relative inline-flex")}
      ref={anchorReference}
    >
      <Button
        aria-expanded={panelOpen}
        aria-label={label}
        className={cn(
          showLabel === true
            ? "h-auto min-h-8 w-full justify-start gap-2 px-2 py-1.5 font-normal text-sm"
            : false,
          className
        )}
        disabled={disabled}
        size={showLabel === true ? "sm" : "icon-sm"}
        type="button"
        variant="ghost"
        {...(showLabel === true ? {} : { title: label })}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          togglePanel();
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          event.stopPropagation();
        }}
      >
        <Copy
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
      {panel}
    </div>
  );
}

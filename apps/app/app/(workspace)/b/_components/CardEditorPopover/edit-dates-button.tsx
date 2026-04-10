"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { CalendarClock } from "lucide-react";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { EditDatesPanel } from "./edit-dates-panel";

export type EditDatesButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  /** @default "Edit dates" */
  label?: string;
  /** Icon + label row (e.g. card actions menu). @default false */
  showLabel?: boolean;
  /** Called after the panel open state changes. */
  onPanelOpenChange?: (open: boolean) => void;
};

export function EditDatesButton({
  className,
  label = "Edit dates",
  showLabel = false,
  onClick,
  onPanelOpenChange,
  onPointerDown,
  ...props
}: EditDatesButtonProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const anchorReference = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });

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

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => {
      const next = !prev;
      onPanelOpenChange?.(next);
      return next;
    });
  }, [onPanelOpenChange]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    onPanelOpenChange?.(false);
  }, [onPanelOpenChange]);

  const panel =
    panelOpen && typeof document !== "undefined"
      ? createPortal(
          <EditDatesPanel
            ignorePointerOutsideRef={anchorReference}
            onClose={closePanel}
            position={panelPosition}
          />,
          document.body
        )
      : null;

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
        <CalendarClock
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

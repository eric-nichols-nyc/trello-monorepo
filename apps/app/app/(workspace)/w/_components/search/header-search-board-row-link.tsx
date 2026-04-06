"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { HeaderSearchBoardHoverPreview } from "./header-search-board-hover-preview";
import {
  CLOSE_DELAY_MS,
  OPEN_DELAY_MS,
  POINTER_OFFSET_X,
  POINTER_OFFSET_Y,
  PREVIEW_MAX_H,
  PREVIEW_MAX_W,
  VIEWPORT_PAD,
} from "./constants";

type HeaderSearchBoardRowLinkProperties = {
  readonly href: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly previewStyle: CSSProperties;
  readonly onClick?: () => void;
};

function clampPreviewPosition(
  clientX: number,
  clientY: number,
): { left: number; top: number } {
  if (typeof window === "undefined") {
    return { left: clientX + POINTER_OFFSET_X, top: clientY + POINTER_OFFSET_Y };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = clientX + POINTER_OFFSET_X;
  let top = clientY + POINTER_OFFSET_Y;
  left = Math.max(
    VIEWPORT_PAD,
    Math.min(left, vw - PREVIEW_MAX_W - VIEWPORT_PAD),
  );
  top = Math.max(
    VIEWPORT_PAD,
    Math.min(top, vh - PREVIEW_MAX_H - VIEWPORT_PAD),
  );
  return { left, top };
}

export const HeaderSearchBoardRowLink = ({
  href,
  title,
  subtitle,
  previewStyle,
  onClick,
}: HeaderSearchBoardRowLinkProperties) => {
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  const pointerRef = useRef({ x: 0, y: 0 });
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overPreviewRef = useRef(false);
  const showPreviewRef = useRef(false);

  const clearOpenTimer = () => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!overPreviewRef.current) {
        setShowPreview(false);
      }
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    showPreviewRef.current = showPreview;
  }, [showPreview]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current !== null) {
        clearTimeout(openTimerRef.current);
      }
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleLinkMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
    clearCloseTimer();
    pointerRef.current = { x: event.clientX, y: event.clientY };
    clearOpenTimer();
    openTimerRef.current = setTimeout(() => {
      setCoords(
        clampPreviewPosition(pointerRef.current.x, pointerRef.current.y),
      );
      setShowPreview(true);
    }, OPEN_DELAY_MS);
  };

  const handleLinkMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (showPreviewRef.current) {
      setCoords(clampPreviewPosition(event.clientX, event.clientY));
    }
  };

  const handleLinkMouseLeave = () => {
    clearOpenTimer();
    scheduleClose();
  };

  const handlePreviewMouseEnter = () => {
    overPreviewRef.current = true;
    clearCloseTimer();
  };

  const handlePreviewMouseLeave = () => {
    overPreviewRef.current = false;
    scheduleClose();
  };

  const previewPortal =
    mounted &&
    showPreview &&
    createPortal(
      <div
        className="pointer-events-auto fixed z-300"
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePreviewMouseLeave}
        style={{ left: coords.left, top: coords.top }}
      >
        <HeaderSearchBoardHoverPreview
          previewStyle={previewStyle}
          subtitle={subtitle}
          title={title}
        />
      </div>,
      document.body,
    );

  return (
    <li className="w-full">
      {previewPortal}
      <Link
        className="header-search-board-row flex w-full min-w-0 items-center gap-3 px-3 py-2 no-underline outline-none"
        href={href}
        onClick={onClick}
        onMouseEnter={handleLinkMouseEnter}
        onMouseLeave={handleLinkMouseLeave}
        onMouseMove={handleLinkMouseMove}
      >
        <div
          className="size-8 shrink-0 overflow-hidden rounded-md bg-center bg-cover shadow-sm ring-1 ring-black/10 ring-inset dark:ring-white/10"
          style={previewStyle}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground text-sm leading-snug">
            {title}
          </p>
          {subtitle !== undefined ? (
            <p className="truncate text-muted-foreground text-xs leading-snug">
              {subtitle}
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  );
};

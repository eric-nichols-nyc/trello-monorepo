"use client";

import { cn } from "@repo/design-system/lib/utils";
import { useState } from "react";

export type CoverSizeMode = "partial" | "full";

/**
 * Chooses between a top strip cover vs full-bleed card background.
 * Selection is local only — persistence / API wiring comes later.
 */
export function CoverSize() {
  const [mode, setMode] = useState<CoverSizeMode>("partial");

  return (
    <div className="space-y-2">
      <p className="font-semibold text-xs text-zinc-400">Size</p>
      <p className="text-sm text-zinc-500 leading-snug">
        Show the cover as a header strip or behind the whole card.
      </p>
      <div className="grid w-full grid-cols-2 gap-2">
        <button
          aria-label="Cover as top strip"
          aria-pressed={mode === "partial"}
          className={cn(
            "flex w-full min-w-0 justify-center rounded-xl p-0.5 transition-[box-shadow,border-color]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80",
            mode === "partial"
              ? "border-2 border-sky-400 ring-2 ring-sky-400/40"
              : "border-2 border-zinc-600/80 border-dashed",
          )}
          onClick={() => setMode("partial")}
          type="button"
        >
          <div className="flex h-[65px] w-[135px] flex-col overflow-hidden rounded-lg bg-zinc-900">
            <div className="relative h-[21px] shrink-0 bg-linear-to-b from-emerald-600/90 to-emerald-900/90">
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white/25 opacity-80 blur-[0.5px]"
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-between p-1">
              <div className="space-y-0.5">
                <div className="h-0.5 w-[85%] rounded-full bg-zinc-600" />
                <div className="h-0.5 w-[65%] rounded-full bg-zinc-600/80" />
              </div>
              <div className="flex items-end justify-between">
                <div className="flex gap-0.5">
                  <div className="size-1.5 rounded-sm bg-zinc-600" />
                  <div className="size-1.5 rounded-sm bg-zinc-600/80" />
                </div>
                <div className="size-2 rounded-full bg-zinc-600" />
              </div>
            </div>
          </div>
        </button>

        <button
          aria-label="Cover as full card background"
          aria-pressed={mode === "full"}
          className={cn(
            "flex w-full min-w-0 justify-center rounded-xl p-0.5 transition-[box-shadow,border-color]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80",
            mode === "full"
              ? "border-2 border-sky-400 ring-2 ring-sky-400/40"
              : "border-2 border-zinc-600/80 border-dashed",
          )}
          onClick={() => setMode("full")}
          type="button"
        >
          <div className="relative h-[65px] w-[135px] overflow-hidden rounded-lg bg-linear-to-b from-emerald-600/85 to-emerald-800/90">
            <div
              aria-hidden
              className="absolute top-2 left-1/2 flex h-7 w-8 -translate-x-1/2 gap-0.5"
            >
              <div className="h-full w-[42%] rounded-sm bg-white/30" />
              <div className="h-full w-[42%] rounded-sm bg-white/20" />
            </div>
            <div className="absolute inset-x-1.5 bottom-1.5 space-y-0.5">
              <div className="h-0.5 w-full rounded-full bg-zinc-950/55" />
              <div className="h-0.5 w-[80%] rounded-full bg-zinc-950/45" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

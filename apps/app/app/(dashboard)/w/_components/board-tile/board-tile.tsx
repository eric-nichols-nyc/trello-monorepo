"use client";

import { Card } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { Star } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

type BoardTileProperties = {
  readonly board: unknown;
};

const DEFAULT_TILE_GRADIENT =
  "linear-gradient(135deg, #2d1b4e 0%, #5c1f4a 42%, #c44c9c 100%)";

const getBoardStringField = (
  board: unknown,
  key:
    | "shortLink"
    | "name"
    | "backgroundColor"
    | "backgroundTopColor"
    | "backgroundBottomColor"
    | "workspaceName"
): string | undefined => {
  if (
    board !== null &&
    typeof board === "object" &&
    key in board &&
    typeof (board as Record<string, unknown>)[key] === "string"
  ) {
    const value = (board as Record<string, string>)[key];
    return value.length > 0 ? value : undefined;
  }
  return;
};

const getBoardBooleanField = (board: unknown, key: "starred"): boolean => {
  if (board !== null && typeof board === "object" && key in board) {
    return (board as Record<string, unknown>)[key] === true;
  }
  return false;
};

const getBoardId = (board: unknown): string | undefined => {
  if (board !== null && typeof board === "object" && "id" in board) {
    const value = (board as Record<string, unknown>).id;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return;
};

const getPreviewBackgroundStyle = (board: unknown): CSSProperties => {
  const top = getBoardStringField(board, "backgroundTopColor");
  const bottom = getBoardStringField(board, "backgroundBottomColor");
  const solid = getBoardStringField(board, "backgroundColor");
  if (top !== undefined && bottom !== undefined) {
    return {
      backgroundImage: `linear-gradient(135deg, ${top}, ${bottom})`,
    };
  }
  if (solid !== undefined) {
    return { backgroundColor: solid };
  }
  return { backgroundImage: DEFAULT_TILE_GRADIENT };
};

export const BoardTile = ({ board }: BoardTileProperties) => {
  const shortLink = getBoardStringField(board, "shortLink");
  const id = getBoardId(board);
  const name = getBoardStringField(board, "name");
  const workspaceLabel = getBoardStringField(board, "workspaceName");
  const starred = getBoardBooleanField(board, "starred");
  const title = name ?? shortLink ?? id;
  const boardKey = shortLink ?? id;
  const href = boardKey !== undefined ? `/b/${boardKey}` : null;
  const previewStyle = getPreviewBackgroundStyle(board);

  const tile = (
    <div className="relative">
      {href !== null ? (
        <Link
          aria-label={
            title !== undefined ? `Open board ${title}` : "Open board"
          }
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href={href}
        />
      ) : null}
      <Card
        className={cn(
          "relative z-1 h-[120px] gap-0 overflow-hidden rounded-xl border border-black/15 bg-transparent py-0 shadow-sm transition-shadow hover:shadow-md dark:border-white/15",
          href !== null && "pointer-events-none"
        )}
      >
        <div
          className="relative h-[86px] w-full shrink-0 bg-center bg-cover"
          style={previewStyle}
        >
          <div className="pointer-events-auto absolute top-2 right-2 z-2">
            <button
              aria-label={starred ? "Unstar board" : "Star board"}
              className="flex size-8 items-center justify-center rounded-md border border-white/20 bg-black/35 shadow-sm backdrop-blur-[2px] transition-colors hover:bg-black/45"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              type="button"
            >
              <Star
                className={cn(
                  "size-4 text-white",
                  starred ? "fill-white" : "fill-transparent"
                )}
                strokeWidth={2}
              />
            </button>
          </div>
          {workspaceLabel !== undefined ? (
            <div className="absolute bottom-2 left-2 rounded border border-white/20 bg-black/40 px-2 py-0.5 font-medium text-[11px] text-white leading-tight shadow-md backdrop-blur-sm">
              {workspaceLabel}
            </div>
          ) : null}
        </div>
        <div className="flex h-[34px] shrink-0 items-center bg-[#1f1f1f] px-3 dark:bg-[#1a1a1a]">
          {title !== undefined ? (
            <p className="truncate font-medium text-[15px] text-white leading-snug">
              {title}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );

  return tile;
};

"use client";

import { Card } from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import {
  getBoardBooleanField,
  getBoardId,
  getBoardStringField,
  getPreviewBackgroundStyle,
} from "@/lib/boards/board-list-utils";
import { useUpdateBoardStarred } from "@/queries/use-update-board-starred";
import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type BoardTileProperties = {
  readonly board: unknown;
};

export const BoardTile = ({ board }: BoardTileProperties) => {
  const shortLink = getBoardStringField(board, "shortLink");
  const id = getBoardId(board);
  const name = getBoardStringField(board, "name");
  const workspaceLabel = getBoardStringField(board, "workspaceName");
  const starred = getBoardBooleanField(board, "starred");
  const [isStarred, setIsStarred] = useState(starred);
  const { isPending, mutate } = useUpdateBoardStarred();

  useEffect(() => {
    setIsStarred(starred);
  }, [starred]);

  const title = name ?? shortLink ?? id;
  const boardKey = shortLink ?? id;
  const canStar = id !== undefined && boardKey !== undefined;
  const href = boardKey !== undefined ? `/b/${boardKey}` : null;
  const previewStyle = getPreviewBackgroundStyle(board);

  const tile = (
    <div className="group relative">
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
              aria-label={isStarred ? "Unstar board" : "Star board"}
              className={cn(
                "flex size-8 items-center justify-center rounded-md border border-white/20 bg-black/35 shadow-sm backdrop-blur-[2px] transition-[opacity,colors] duration-200 hover:bg-black/45",
                isStarred
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
              disabled={!canStar || isPending}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!canStar || isPending) {
                  return;
                }
                const next = !isStarred;
                setIsStarred(next);
                mutate(
                  { boardId: id, boardKey, starred: next },
                  {
                    onError: () => {
                      setIsStarred(starred);
                    },
                  },
                );
              }}
              type="button"
            >
              <Star
                className={cn(
                  "size-4 text-white",
                  isStarred ? "fill-white" : "fill-transparent"
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

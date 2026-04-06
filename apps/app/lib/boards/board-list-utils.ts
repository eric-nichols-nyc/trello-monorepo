import type { CSSProperties } from "react";

export const DEFAULT_TILE_GRADIENT =
  "linear-gradient(135deg, #2d1b4e 0%, #5c1f4a 42%, #c44c9c 100%)";

export const getBoardStringField = (
  board: unknown,
  key:
    | "shortLink"
    | "name"
    | "backgroundColor"
    | "backgroundImage"
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

export const getBoardWorkspaceId = (board: unknown): string | undefined => {
  if (
    board !== null &&
    typeof board === "object" &&
    "workspaceId" in board &&
    typeof (board as Record<string, unknown>).workspaceId === "string"
  ) {
    const value = (board as Record<string, string>).workspaceId;
    return value.length > 0 ? value : undefined;
  }
  return;
};

export const getBoardBooleanField = (board: unknown, key: "starred"): boolean => {
  if (board !== null && typeof board === "object" && key in board) {
    return (board as Record<string, unknown>)[key] === true;
  }
  return false;
};

export const getBoardId = (board: unknown): string | undefined => {
  if (board !== null && typeof board === "object" && "id" in board) {
    const value = (board as Record<string, unknown>).id;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return;
};

export const getPreviewBackgroundStyle = (board: unknown): CSSProperties => {
  const imageUrl = getBoardStringField(board, "backgroundImage");
  if (imageUrl !== undefined) {
    return { backgroundImage: `url(${JSON.stringify(imageUrl)})` };
  }

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

function getBoardSortTime(board: unknown): number {
  if (board !== null && typeof board === "object") {
    const record = board as Record<string, unknown>;
    for (const key of ["updatedAt", "createdAt"] as const) {
      const value = record[key];
      if (typeof value === "string") {
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
  }
  return 0;
}

/** Newest first (uses `updatedAt`, then `createdAt` when present). */
export const sortBoardsRecentFirst = (boards: readonly unknown[]): unknown[] =>
  [...boards].sort((a, b) => getBoardSortTime(b) - getBoardSortTime(a));

/** Boards where `starred === true`, newest first. */
export const filterStarredBoardsSorted = (
  boards: readonly unknown[],
): unknown[] =>
  sortBoardsRecentFirst(boards.filter((b) => getBoardBooleanField(b, "starred")));

/** Boards where `starred !== true`, newest first. */
export const filterUnstarredBoardsSorted = (
  boards: readonly unknown[],
): unknown[] =>
  sortBoardsRecentFirst(
    boards.filter((b) => !getBoardBooleanField(b, "starred")),
  );

/** Stable React `key` for a board in a list. */
export const getStableBoardKey = (board: unknown, index: number): string => {
  const id = getBoardId(board);
  if (id !== undefined) {
    return id;
  }
  return `board-${index}`;
};

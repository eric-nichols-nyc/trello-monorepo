/** Stable cache key for board detail; used by `useBoardDetail` and future invalidations. */
export const boardDetailQueryKey = (boardKey: string) =>
  ["board", "detail", boardKey] as const;

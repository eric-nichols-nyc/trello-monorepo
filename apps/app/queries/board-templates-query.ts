/** Cache key for `GET /api/board-templates` (authenticated catalog). */
export const boardTemplatesCatalogQueryKey = () =>
  ["board-templates", "catalog"] as const;

/**
 * Ordering domain for this monorepo (Trello-style `pos` + relational ids).
 *
 * Map from a generic kanban / “task in column” model:
 *
 * | Generic / older clone | This repo (Prisma + API + `BoardCard`) |
 * | --------------------- | --------------------------------------- |
 * | `Task`                | `Card` / `BoardCard`                    |
 * | `column_id`           | `listId`                                |
 * | `position` (number)   | `pos` (`Float` in DB, `number` in TS)   |
 * | Column / list order   | `List.pos` on `boardId`                 |
 *
 * Use {@link CardOrderingRow} as the minimal shape for fractional-position
 * calculators and drag-and-drop payloads (move card → new `listId` + `pos`).
 *
 * Use {@link ListOrderingRow} for horizontal list reorder on a board.
 */

/** Fields that define sort order of cards within one list (`List.cards`). */
export type CardOrderingRow = {
  id: string;
  listId: string;
  pos: number;
};

/** Fields that define sort order of lists on a board (`Board.lists`). */
export type ListOrderingRow = {
  id: string;
  boardId: string;
  pos: number;
};

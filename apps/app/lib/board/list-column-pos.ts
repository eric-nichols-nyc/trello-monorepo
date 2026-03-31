/**
 * Derives Trello-style fractional `List.pos` values for a column order without
 * rewriting every row: each slot uses neighbors’ **current DB** positions
 * (gap or midpoint). Consumed by board UI persistence and optional debug display.
 *
 * `LIST_POS_GAP` matches the card `KanbanCardPositionCalculator` step (1000).
 *
 * How this fits with drag order vs stored `pos`: see `components/dnd-board/README.md`.
 */
const LIST_POS_GAP = 1000;

/** `listId` at index `i`; `prevPos` / `nextPos` come from stored positions of i±1. */
function suggestedPosForSlot(
  listId: string,
  prevPos: number | undefined,
  nextPos: number | undefined,
  posByListId: Record<string, number>
): number {
  const hasPrev = prevPos !== undefined;
  const hasNext = nextPos !== undefined;
  if (!(hasPrev || hasNext)) {
    return posByListId[listId] ?? LIST_POS_GAP;
  }
  if (!hasPrev && hasNext) {
    return nextPos - LIST_POS_GAP;
  }
  if (hasPrev && !hasNext) {
    return prevPos + LIST_POS_GAP;
  }
  if (prevPos === undefined || nextPos === undefined) {
    return posByListId[listId] ?? LIST_POS_GAP;
  }
  return (prevPos + nextPos) / 2;
}

/**
 * For each id in `listIds` (left → right), returns a suggested `pos` if that list
 * were placed at that index. Only the dragged list’s value is typically sent to the API.
 */
export function suggestedListPositionsForOrder(
  listIds: string[],
  posByListId: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};
  const n = listIds.length;
  for (let i = 0; i < n; i++) {
    const id = listIds[i];
    const prevId = i > 0 ? listIds[i - 1] : undefined;
    const nextId = i < n - 1 ? listIds[i + 1] : undefined;
    const prevPos = prevId !== undefined ? posByListId[prevId] : undefined;
    const nextPos = nextId !== undefined ? posByListId[nextId] : undefined;
    result[id] = suggestedPosForSlot(id, prevPos, nextPos, posByListId);
  }
  return result;
}

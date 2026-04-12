# Nested board DnD (demo / lab)

This folder is a **sandbox** for Trello-style **nested drag-and-drop** (horizontal columns + vertical cards). It is **not imported** by production routes. Use it to iterate on interaction and to **visualize fractional list positions** next to the real app’s positioning helpers.

## Storybook

- Story: **`app/DndBoard demo`** (`apps/storybook/stories/dnd-board-demo.stories.tsx`)
- Run: `pnpm --filter storybook dev`

## Mental model: three layers

Keeping these separate avoids mixing pointer logic with DB `pos` math (where mistakes cost the most time).

| Layer | Responsibility | This folder | Production |
| --- | --- | --- | --- |
| **1. Interaction** | After a drag, what is the new **canonical order**? | `listIds` + `cardsByList` updated via `move()` from `@dnd-kit/helpers` | Same idea in `useBoardListsDrag` |
| **2. Diff** | Did order change vs the drag **snapshot**? | Only “cancel → restore snapshot” | Plus “should we PATCH?” |
| **3. Position** | Given **current order** + **stored** server `pos`, what should we **suggest** or **send**? | `suggestedListPositionsForOrder` in the column header debug line | `suggestedListPositionsForOrder` + `cardMovePersistPayload` + mutations |

**Invariants**

- **Canonical UI order** is always `listIds` (column order) and `cardsByList[listId]` (card order per column).
- **Stored positions** (`list.pos`, `card.pos` on the server) **do not change** until persistence succeeds; suggested values are **derived** from current order + those stored numbers.

## Files (quick map)

- **`nested-board-types.ts`** — Serializable initial state for the demo (`NestedBoardInitialState`).
- **`sample-nested-board.ts`** — `SAMPLE_NESTED_BOARD` fixture (two lists, three cards, `listPosById`).
- **`use-nested-board-drag.ts`** — Local state, sensors, `move()`, snapshot restore; **no** React Query or API.
- **`demo-sortable-column.tsx` / `demo-sortable-card.tsx`** — Minimal sortable UI (not `BoardColumn` / `ListCard`).
- **`nested-board-demo.tsx`** — `DragDropProvider`, column list, `DragOverlay`.

## Related production code

- **DnD + persist**: `app/(workspace)/b/_components/BoardList/use-board-lists-drag.ts`, `board-lists.tsx`, `board-column.tsx`
- **List fractional pos**: `lib/board/list-column-pos.ts` — `suggestedListPositionsForOrder`
- **Card moves / payloads**: `lib/board/card-list-pos.ts` — e.g. `cardMovePersistPayload`

## Integrating into the app later

The demo is **not** a drop-in replacement for `BoardLists`. To reuse the ideas:

1. Share or align the **interaction** hook with `useBoardListsDrag` (same `move()` + snapshot pattern).
2. Keep **position** logic in **`lib/board/*`** pure functions with tests/fixtures.
3. Swap **demo chrome** for real components (`ListHeader`, `ListFooter`, `ListCard`, etc.) once behavior matches.

Pointing an assistant at **this README + one fixture** (e.g. `SAMPLE_NESTED_BOARD`) plus “only change layer 1 or only layer 3” reduces bad cross-edits.

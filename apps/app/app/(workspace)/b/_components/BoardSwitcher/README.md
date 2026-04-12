# BoardSwitcher

Modal “switch boards” UI for the board workspace: full-screen dimmed backdrop, bottom-centered sheet with search and a scrollable list of boards (tiles link to `/b/...`).

## Where it’s used

- **`IslandNav`** (`../IslandNav/island-nav.tsx`) toggles `open` from the dock’s “switch boards” control and passes `boards` from `useWorkspaceShellBoards()` plus `currentBoardKey` from the board route.

## Public API

Import from **`board-switcher.tsx`** (barrel — avoids reaching into internals):

- **`BoardSwitcher`** — production entry: wires **`usePathname`** and **`useWorkspaceShellWorkspaces`** into the view.
- **`BoardSwitcherView`** — presentational tree + behavior (portal, Escape, body scroll lock, auto-close on pathname change). Use in Storybook or tests with mocked `pathname` / `workspaceSummaries`.

Optional **`boardTileComponent`** overrides the default **`BoardTile`** for the panel list (see `apps/storybook/stories/board-switcher.stories.tsx`).

## Files

| File | Role |
|------|------|
| `board-switcher.tsx` | Re-exports `BoardSwitcher`, `BoardSwitcherView`, and their prop types. |
| `board-switcher-container.tsx` | **`BoardSwitcher`**: reads pathname + workspace summaries, passes everything to the view. |
| `board-switcher-view.tsx` | **`BoardSwitcherView`**: `createPortal` to `document.body`, dialog shell, composes header + panel. |
| `board-switcher-header.tsx` | Search field and toolbar row (list/pin placeholders). |
| `board-switcher-panel.tsx` | Sorted/filtered board list, workspace labels, links; defaults to **`BoardTile`**. |

## Behavior notes

- Renders **nothing** until the client has mounted (avoids SSR/portal mismatch), and **nothing** when `open` is false.
- **Escape** and **backdrop click** call `onClose`.
- **Pathname change** while open (e.g. user picks a board) closes the switcher.
- **`boards`** is typed as `readonly unknown[]`; tiles use **`@/lib/boards/board-list-utils`** helpers so the list stays tolerant of API shapes.

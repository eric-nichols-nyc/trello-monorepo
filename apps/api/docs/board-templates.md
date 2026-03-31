# Board templates

## What the client sends

The client does **not** send the full template structure in the request body. That would let anyone invent arbitrary lists and cards and would duplicate what the server already knows.

Instead:

1. **`GET /board-templates`** (authenticated) returns a small catalog: `id`, `title`, optional `description` — enough to render a picker.
2. **`POST /boards`** includes the normal board fields (`name`, `workspaceId`, …) plus optional **`templateId`** (a string id from that catalog).

The API resolves `templateId` to a **bundled** JSON definition under `src/boards/templates/data/`, creates the board row (with template defaults for background fields, overridable by the same optional fields you already send on create), then creates lists and cards in a single transaction.

## Adding a template

1. Add a new file: `src/boards/templates/data/<slug>.template.json` matching the shape validated by `board-template.schema.ts` (`id`, `title`, optional `description`, optional `board` defaults, `lists` with `cards`). Each card may include optional `coverColor` or `coverImage` (not both).
2. Import it in `src/boards/templates/registry.ts` and append it to `rawTemplates`.
3. Rebuild the API (`nest build` copies `*.json` from that folder into `dist` via `nest-cli.json` assets).

Invalid definitions fail at startup when the registry parses them.

## Example `POST /boards` body

```json
{
  "name": "Sprint 12",
  "workspaceId": "00000000-0000-0000-0000-000000000000",
  "templateId": "simple-kanban"
}
```

Optional background fields on the same request override the template’s `board` defaults for those keys.

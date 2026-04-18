# cURL examples (Nest API)

All routes live under the **`/api`** prefix (see `main.ts`). Replace placeholders:

| Placeholder | Meaning |
|-------------|---------|
| `API` | API origin, e.g. `http://localhost:3000` |
| `TOKEN` | Clerk **session** JWT (`Authorization: Bearer …`) |
| `WORKSPACE_ID` | UUID from `GET …/users/me` → `workspaces[].id` or create workspace |
| `CARD_KEY` | Card `id` or `shortLink` |

Obtain a test JWT from `apps/api`: `pnpm get-token` (see `scripts/get-clerk-token.ts` and `.env`). For a fuller request set, import `postman/Trello-API.postman_collection.json`.

---

## Public

```bash
curl -sS "$API/api/health"
```

---

## Current user

```bash
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/users/me"
```

```bash
curl -sS -X DELETE -H "Authorization: Bearer $TOKEN" "$API/api/users/me"
```

---

## Board templates (catalog)

```bash
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/board-templates"
```

New templates are added as JSON in the repo, not via HTTP — see [board-templates.md](./board-templates.md).

---

## Boards

**List** (current user):

```bash
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/boards"
```

**Create** (empty board):

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"My board\",\"workspaceId\":\"$WORKSPACE_ID\"}" \
  "$API/api/boards"
```

**Create from template** (`templateId` must exist in the server registry, e.g. `simple-kanban`):

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"From template\",\"workspaceId\":\"$WORKSPACE_ID\",\"templateId\":\"simple-kanban\"}" \
  "$API/api/boards"
```

**Get one** (`BOARD_KEY` = board `id` or `shortLink`):

```bash
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/boards/$BOARD_KEY"
```

**Patch / delete** (`BOARD_ID` = primary UUID):

```bash
curl -sS -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Renamed"}' \
  "$API/api/boards/$BOARD_ID"
```

```bash
curl -sS -X DELETE -H "Authorization: Bearer $TOKEN" "$API/api/boards/$BOARD_ID"
```

---

## Cards

**Upload attachment** (multipart field `file`; PDF, images, and other allowed types per API — max 25 MB):

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf" \
  "$API/api/cards/$CARD_KEY/attachments"
```

---

## Shell helpers

```bash
export API=http://localhost:3000
export TOKEN='eyJ...'   # paste JWT
export WORKSPACE_ID='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
export CARD_KEY='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
```

Pretty-print JSON if you have `jq`:

```bash
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/users/me" | jq
```

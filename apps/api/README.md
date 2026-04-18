# API

NestJS REST API for a Trello-style app: **boards**, **lists**, **cards**, **comments**, **checklists**, and **checklist items** (plus **workspaces** and **users/me**).

## Quick start

```bash
# From repo root
pnpm --filter api dev

# Or from this directory
pnpm dev
```

Requires a Postgres database. Set `DATABASE_URL` in `apps/api/.env`, then run `pnpm db:push` to apply the schema.

### Why some tables are missing in Neon

`prisma/schema.prisma` is the **full** data model (`Workspace`, `Label`, `Comment`, `Checklist`, `CheckItem`, card–label join, etc.). The files under `prisma/migrations/` only describe an **older, partial** evolution (initial `User` / `Board` / `List` / `Card`, a few column changes, and `Attachment`). They do **not** recreate every table in the current schema.

So if you only run **`prisma migrate deploy`** (or reset) and never **`db push`**, the database can end up with a small subset of tables—while the app and Prisma client expect the whole schema.

**Fix (development / when you can afford schema changes):** from `apps/api`, with `DATABASE_URL` pointing at the right Neon branch:

```bash
pnpm db:push
```

That syncs the live database to `schema.prisma` (creates missing tables and columns). Use a **non-production** branch first if you are unsure. **`migrate reset`** alone will not add `Workspace` and friends until the migration history is brought in line with the schema (a larger cleanup / baseline task).

If `db push` reports conflicts, paste the error—often it is a type rename or NOT NULL column that needs a one-off SQL backfill.

**Demo data:** `pnpm db:seed` creates a synthetic user (`user_seed_local_demo`) plus workspace + **Seed board** graph. Use `pnpm db:seed -- --fresh` to wipe and recreate that synthetic user.

**Your real Clerk user:** if you already have a row (e.g. from `GET /users/me`), attach the same demo board to that account:

```bash
SEED_CLERK_USER_ID=user_3AeBqoeILoFdovPUTlE0rvg1sYX pnpm db:seed
```

Optional: `SEED_WORKSPACE_ID=<uuid>` (defaults to your oldest workspace). `pnpm db:seed -- --fresh` with a real `SEED_CLERK_USER_ID` only removes boards named **Seed board** for that user—not the user itself.

### Postman / local testing

Import **`postman/Trello-API.postman_collection.json`** into Postman or **HTTPie Desktop** (Import → Postman collection). Set collection variables: **`token`** (Clerk JWT), then **`workspaceId`**, **`boardId`**, **`listId`**, **`cardId`**, etc., from API responses.

The older **`postman/Boards.postman_collection.json`** is outdated (e.g. `title` vs `name`); prefer **`Trello-API.postman_collection.json`**.

**Auth:** Protected routes need a Clerk session JWT: `Authorization: Bearer <token>`.

1. Create a JWT template (e.g. named `default`) in [Clerk Dashboard → JWT templates](https://dashboard.clerk.com/~/jwt-templates).
2. Set `CLERK_SECRET_KEY` and `CLERK_USER_ID` (a real Clerk user id) in `.env`, then run `pnpm get-token` and copy the printed token.

**Handy flow:**

- **`GET /users/me`** – Returns the current DB user and **`workspaces`** (includes the default **"My workspace"** after the first authed request). Use a workspace **`id`** as **`workspaceId`** when creating a board.
- **`POST /boards`** – Body: `{ "name": "My First Board", "workspaceId": "<uuid from /users/me>" }`
- **`GET /boards`** – List boards
- **`GET /boards/:id`** – Board by id (set `boardId` in collection variables after creating)
- **`PATCH /boards/:id`** – Body: `{ "name": "...", "background": "...", "closed": false }` (fields optional)
- **`DELETE /boards/:id`**

**Lists** (nested under a board)

| Method | Path | Auth (Bearer) |
|--------|------|-----------------|
| `GET` | `/boards/:boardId/lists` | Yes |
| `POST` | `/boards/:boardId/lists` | Yes — body: `{ "name": "…", "pos"?: number, "closed"?: boolean }` |
| `GET` | `/lists/:id` | Yes |
| `PATCH` | `/lists/:id` | Yes |
| `DELETE` | `/lists/:id` | Yes |

**Cards** (nested under a list)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/lists/:listId/cards` | Yes |
| `POST` | `/lists/:listId/cards` | Yes — body: `name`, optional `description`, `pos`, `closed`, `dueDate`, `assigneeId` |
| `GET` | `/cards/:id` | Yes |
| `PATCH` | `/cards/:id` | Yes — optional `listId` (same board only), `assigneeId`, etc. |
| `DELETE` | `/cards/:id` | Yes |

**Comments** (on a card; **POST** sets **`authorId`** from the JWT user)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/cards/:cardId/comments` | Yes |
| `POST` | `/cards/:cardId/comments` | Yes — body: `{ "text": "…" }` |
| `GET` | `/comments/:id` | Yes |
| `PATCH` | `/comments/:id` | Yes |
| `DELETE` | `/comments/:id` | Yes |

**Checklists & items**

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/cards/:cardId/checklists` | Yes |
| `POST` | `/cards/:cardId/checklists` | Yes — body: `{ "name": "…", "pos"?: number }` |
| `GET` | `/checklists/:id` | Yes |
| `PATCH` | `/checklists/:id` | Yes |
| `DELETE` | `/checklists/:id` | Yes |
| `GET` | `/checklists/:checklistId/items` | Yes |
| `POST` | `/checklists/:checklistId/items` | Yes — body: `name`, optional `pos`, `completed` |
| `GET` | `/checklist-items/:id` | Yes |
| `PATCH` | `/checklist-items/:id` | Yes |
| `DELETE` | `/checklist-items/:id` | Yes |

Collection variables: `baseUrl` (default `http://localhost:3000`), `boardId` (set from a create response).

### User & default workspace provisioning

Provisioning runs from **Clerk webhooks** (`POST /webhooks/clerk`), not from the JWT guard. Implementation: `src/webhooks/webhooks.controller.ts` → `ClerkWebhooksService.ensureUserAndDefaultWorkspace()` in `src/webhooks/webhooks.service.ts`.

**User**

- On **`user.created`**, **`user.updated`**, or **`session.created`** (with `data.user`), the API **upserts** a `User` row keyed by **`clerkUserId`** using the Clerk user payload (with optional Backend API enrichment when the webhook body has no email yet).

**Workspace**

- After the user row is settled, the handler checks whether **any** `Workspace` exists with **`ownerId`** equal to that user’s id.
- If **none** → creates **one** default workspace named **`"My workspace"`** with that **`ownerId`**.

**`ClerkAuthGuard`** only **verifies** the JWT and attaches claims to the request; it does **not** write to the database.

Until the webhook has run for a given Clerk user, authenticated routes that expect a DB user may return **404** (“user not found”).

### Clerk webhook (`POST /webhooks/clerk`)

Set **`CLERK_WEBHOOK_SECRET`** or **`CLERK_WEBHOOK_SIGNING_SECRET`** to the **`whsec_...`** signing secret from Clerk → Webhooks → your endpoint.

#### Local dev: expose the API with **ngrok**

Clerk sends webhooks over the public internet, so **`localhost` is not reachable**. Use **[ngrok](https://ngrok.com/)** (or similar) to tunnel to your Nest process.

1. Start the API (default port **`3000`**, or match **`PORT`** in `.env`).
2. In another terminal, run:
   ```bash
   ngrok http 3000
   ```
   Use the same port your API listens on if it’s not `3000`.
3. Copy the **HTTPS** forwarding URL from the ngrok output (e.g. `https://abc-123.ngrok-free.app`).
4. In [Clerk → Webhooks](https://dashboard.clerk.com/~/webhooks), set the endpoint URL to:
   ```text
   https://<your-ngrok-host>/webhooks/clerk
   ```
5. Subscribe to the events you need (e.g. **`user.created`**) and save.

**Notes**

- Stopping ngrok (e.g. closing that terminal) ends the tunnel. On the **free** ngrok plan you usually get a **new** URL on the next run—update the Clerk endpoint when it changes. A **reserved domain** (paid) keeps the URL stable.
- If ngrok shows an interstitial page in the browser, webhook **`POST`** requests from Clerk still typically reach your app; if anything fails, check ngrok’s **web interface** (e.g. `http://127.0.0.1:4040`) for request/response details.

The handler **writes** rows only when it can resolve a **User** from the event:

| Event | When it syncs |
|--------------|----------------|
| **`user.created`** / **`user.updated`** | Always (payload is the user). |
| **`session.created`** | Only if **`data.user`** is present (sign-in). |

If you use **Testing** in the Clerk Dashboard, choose **`user.created`** in the event dropdown (or another event that includes a user). A **200** response with **`"synced": false`** means verification succeeded but this event type didn’t include user data—nothing is written to the DB. Check the JSON response body or server logs.

---

## How NestJS works in this app

### Modules, controllers, and services

- **Modules** group the app into features. Each module declares its controllers and providers (e.g. services) and can import other modules.
- **Controllers** define HTTP routes. They use decorators like `@Controller('boards')`, `@Get()`, `@Post()`, `@Body()`, `@Param()` to map requests to handler methods.
- **Services** hold business logic and database access. Controllers depend on services via **dependency injection (DI)**: Nest injects the service into the controller constructor.

Example: `BoardsController` has `constructor(private readonly boardsService: BoardsService)`. Nest creates one `BoardsService` (and its dependency `PrismaService`) and passes it in. You never call `new BoardsService()` yourself.

### Project layout

| Path | Purpose |
|------|--------|
| `src/main.ts` | Bootstrap: create app, CORS, global pipes, listen on port. |
| `src/app.module.ts` | Root module: imports feature modules, registers `AppController` / `AppService`. |
| `src/prisma/` | `PrismaModule` and `PrismaService` (Prisma client with pg adapter). Global, so any module can inject `PrismaService`. |
| `src/users/` | `UsersModule`, `UsersService`. |
| `src/app.controller.ts` | Root routes + **`GET /users/me`** (current user + workspaces). |
| `src/boards/` | `BoardsModule`, board CRUD. |
| `src/lists/` | `ListsModule`, **`boards/:boardId/lists`** + **`/lists/:id`**. |
| `src/cards/` | `CardsModule`, **`lists/:listId/cards`** + **`/cards/:id`**. |
| `src/comments/` | `CommentsModule`, **`cards/:cardId/comments`** + **`/comments/:id`**. |
| `src/checklists/` | `ChecklistsModule`, card checklists, **`/checklists`**, **`checklist-items`**. |
| `src/workspaces/` | `WorkspacesModule`. |
| `src/webhooks/` | Clerk webhook handler. |
| `src/common/pipes/` | Shared pipes (e.g. `ZodValidationPipe`). |

Routes are defined in controllers: base path from `@Controller(...)`, method and path from `@Get()`, `@Post()`, `@Patch()`, `@Delete()`, etc.

---

## Validation

We use two validation approaches.

### 1. Global: class-validator + ValidationPipe

In `main.ts` we register a global **ValidationPipe** with:

- **whitelist: true** – strip properties not present on the DTO.
- **forbidNonWhitelisted: true** – return 400 if the client sends extra properties.
- **transform: true** – coerce query/body to the types declared on the DTO.

For this to work, request body DTOs must use **class-validator** decorators (e.g. `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`). Only decorated properties are considered “whitelisted.” Example: `UpdateBoardDto` in `src/boards/dto/update-board.dto.ts` uses `@IsOptional()` and `@IsString()` so `PATCH /boards/:id` body is validated and typed.

### 2. Per-route: Zod + ZodValidationPipe

For **create board** we validate with **Zod** instead of class-validator:

- **Schema:** `src/boards/schemas/create-board.schema.ts` defines `createBoardSchema` (`name`, `workspaceId`, …) and exports the type `CreateBoardInput`.
- **Pipe:** `src/common/pipes/zod-validation.pipe.ts` is a generic pipe that takes a Zod schema, runs `safeParse()` on the incoming value, and throws `BadRequestException` with the first error message if validation fails.
- **Usage:** The create handler uses `@UsePipes(new ZodValidationPipe(createBoardSchema))` and types the body as `CreateBoardInput`. The global ValidationPipe still runs first, but the Zod pipe runs on the same body and effectively “owns” validation for that route.

So in this app:

- **POST** bodies for boards, lists, cards, comments, checklists, and checklist items – validated with **Zod** via `ZodValidationPipe` and the matching `create*.schema.ts`.
- **PATCH** routes – validated with **class-validator** via the global **ValidationPipe** and the corresponding `Update*Dto` class.

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start in watch mode (default port 3000). |
| `pnpm build` | Generate Prisma client and build for production. |
| `pnpm start` | Run production build. |
| `pnpm db:generate` | Generate Prisma client. |
| `pnpm db:push` | Push schema to the database (no migrations). |
| `pnpm db:studio` | Open Prisma Studio. |
| `pnpm db:seed` | Insert demo user + board data (`-- --fresh` to reset). |

# API

NestJS REST API for the Trello-style app. Provides CRUD for boards (and related lists/cards via Prisma).

## Quick start

```bash
# From repo root
pnpm --filter api dev

# Or from this directory
pnpm dev
```

Requires a Postgres database. Set `DATABASE_URL` in `apps/api/.env`, then run `pnpm db:push` to apply the schema.

### Postman / local testing

Import **`postman/Boards.postman_collection.json`** into Postman for ready-made requests (update bodies if the collection still uses older field names).

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

Collection variables: `baseUrl` (default `http://localhost:3000`), `boardId` (set from a create response).

### User & default workspace provisioning

Provisioning runs on **every** request that uses **`ClerkAuthGuard`** (after the JWT is verified). Implementation: `src/auth/clerk-auth.guard.ts` → `UsersService.ensureUserAndDefaultWorkspace()` in `src/users/users.service.ts`.

**User**

- The app **upserts** a `User` row keyed by **`clerkUserId`** (from the JWT `sub`).
- If this Clerk user is **new** → **insert**.
- If they **already exist** → **update** profile fields from the token when present (email, first/last name, image).

**Workspace**

- After the user row is settled, the app checks whether **any** `Workspace` exists with **`ownerId`** equal to that user’s id.
- If **none** → creates **one** default workspace named **`"My workspace"`** with that **`ownerId`**.
- If **at least one** already exists → **does not** create another default (you can still add more via **`POST /workspaces`**).

This is **not** tied to Clerk’s “sign up” event in the dashboard; it runs on the **first authenticated API call** (and keeps the user row updated on later calls). For provisioning at signup without hitting the API, use a **Clerk webhook** instead.

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
| `src/app.module.ts` | Root module: imports `PrismaModule`, `BoardsModule`, registers `AppController` / `AppService`. |
| `src/prisma/` | `PrismaModule` and `PrismaService` (Prisma client with pg adapter). Global, so any module can inject `PrismaService`. |
| `src/users/` | `UsersModule`, `UsersService`. |
| `src/app.controller.ts` | Root routes + **`GET /users/me`** (current user + workspaces). |
| `src/boards/` | Feature: `BoardsModule`, `BoardsController`, `BoardsService`, DTOs, Zod schema. |
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

- **POST /boards** – validated with **Zod** via `ZodValidationPipe` and `createBoardSchema`.
- **PATCH /boards/:id** (and any other body DTOs) – validated with **class-validator** via the global **ValidationPipe** and the corresponding DTO class.

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

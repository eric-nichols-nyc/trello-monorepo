# `@repo/schemas`

Shared [Zod](https://zod.dev) schemas for validation and inferred TypeScript types.

## Usage (when wired)

```ts
import { createBoardSchema, createWorkspaceSchema } from "@repo/schemas";
```

## Contents

- **Workspace** – `createWorkspaceSchema` / `CreateWorkspaceInput`
- **Board** – `createBoardSchema` / `CreateBoardInput`
- **User** – `createUserSchema`, `updateUserSchema`, `CreateUserInput`, `UpdateUserInput`

The `apps/api` app may still use local copies of these until it is switched to depend on this package.

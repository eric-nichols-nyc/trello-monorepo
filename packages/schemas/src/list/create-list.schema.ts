import { z } from "zod";

/**
 * Body for `POST /api/boards/:boardId/lists` (Nest `BoardListsController#create`).
 * Align with `apps/api/src/lists/schemas/create-list.schema.ts`.
 */
export const createListSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  pos: z.number().finite().optional(),
  closed: z.boolean().optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

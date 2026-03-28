import { z } from "zod";

/**
 * Body for `POST /api/lists/:listId/cards` (Nest `ListCardsController#create`).
 *
 * Keep this file aligned with `apps/api/src/cards/schemas/create-card.schema.ts`
 * until the API imports `@repo/schemas` directly (then delete the duplicate).
 *
 * **Quick add UI** usually only sends `{ name }`; other fields are optional for
 * richer clients or future forms.
 */
export const createCardSchema = z.object({
  /** Card title; required for create. `.trim()` runs as part of validation. */
  name: z.string().min(1, "name is required").trim(),

  description: z.string().optional(),

  /** Midpoint / ordering; server defaults to `Date.now()` when omitted. */
  pos: z.number().finite().optional(),

  closed: z.boolean().optional(),

  dueDate: z.coerce.date().optional(),

  assigneeId: z.string().uuid().optional(),
});

/** Inferred input type — use with `safeParse` / `parse` in the Next app form. */
export type CreateCardInput = z.infer<typeof createCardSchema>;

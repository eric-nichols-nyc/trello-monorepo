import { z } from "zod";

export const reorderListCardsSchema = z.object({
  cardIds: z.array(z.string().uuid()).min(1),
});

export type ReorderListCardsInput = z.infer<typeof reorderListCardsSchema>;

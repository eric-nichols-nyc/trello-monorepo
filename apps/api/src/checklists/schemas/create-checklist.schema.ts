import { z } from "zod";

export const createChecklistSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  pos: z.number().finite().optional(),
});

export type CreateChecklistInput = z.infer<typeof createChecklistSchema>;

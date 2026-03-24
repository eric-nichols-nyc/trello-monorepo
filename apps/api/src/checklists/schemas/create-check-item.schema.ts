import { z } from "zod";

export const createCheckItemSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  pos: z.number().finite().optional(),
  completed: z.boolean().optional(),
});

export type CreateCheckItemInput = z.infer<typeof createCheckItemSchema>;

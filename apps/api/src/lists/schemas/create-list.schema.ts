import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  pos: z.number().finite().optional(),
  closed: z.boolean().optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

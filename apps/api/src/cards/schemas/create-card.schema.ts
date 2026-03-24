import { z } from "zod";

export const createCardSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  description: z.string().optional(),
  pos: z.number().finite().optional(),
  closed: z.boolean().optional(),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.string().uuid().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

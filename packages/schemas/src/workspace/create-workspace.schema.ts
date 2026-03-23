import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  description: z.string().trim().optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

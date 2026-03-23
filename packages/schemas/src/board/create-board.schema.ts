import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  workspaceId: z.string().uuid("workspaceId must be a valid UUID"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

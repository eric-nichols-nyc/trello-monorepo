import { z } from "zod";

export const createCommentSchema = z.object({
  text: z.string().min(1, "text is required").trim(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

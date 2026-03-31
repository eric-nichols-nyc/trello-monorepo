import { z } from "zod";

const boardBackgroundBrightness = z.enum(["light", "dark"]);

export const createBoardSchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  workspaceId: z.string().uuid("workspaceId must be a valid UUID"),
  shortLink: z.string().min(1).max(64).trim().optional(),
  backgroundImage: z.string().min(1).optional(),
  backgroundBrightness: boardBackgroundBrightness.optional(),
  backgroundBottomColor: z.string().optional(),
  backgroundTopColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  starred: z.boolean().optional(),
  /** Server resolves this id to bundled JSON; the client does not send template JSON. */
  templateId: z.string().min(1).optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

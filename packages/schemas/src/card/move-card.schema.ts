import { z } from "zod";

/** Body for PATCH card move / reparent (Nest `UpdateCardDto` subset). */
export const moveCardPatchSchema = z
  .object({
    listId: z.string().uuid().optional(),
    pos: z.number().finite().optional(),
  })
  .refine((d) => d.listId !== undefined || d.pos !== undefined, {
    message: "At least one of listId or pos is required",
  });

export type MoveCardPatchInput = z.infer<typeof moveCardPatchSchema>;

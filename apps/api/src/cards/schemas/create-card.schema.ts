import { z } from "zod";

export const createCardSchema = z
  .object({
    name: z.string().min(1, "name is required").trim(),
    description: z.string().optional(),
    pos: z.number().finite().optional(),
    closed: z.boolean().optional(),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.string().uuid().optional(),
    coverColor: z.string().min(1).optional(),
    coverImage: z.string().min(1).optional(),
    shortLink: z.string().min(1).max(64).trim().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.coverColor !== undefined && val.coverImage !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Send only one of coverColor or coverImage",
        path: ["coverImage"],
      });
    }
  });

export type CreateCardInput = z.infer<typeof createCardSchema>;

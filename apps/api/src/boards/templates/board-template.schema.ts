import { z } from "zod";

const templateCardSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    coverColor: z.string().min(1).optional(),
    coverImage: z.string().min(1).optional(),
    closed: z.boolean().optional(),
    completed: z.boolean().optional(),
    /** ISO-8601 datetime string */
    dueDate: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.coverColor !== undefined && val.coverImage !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Use only one of coverColor or coverImage per template card",
        path: ["coverImage"],
      });
    }
  });

const templateListSchema = z.object({
  name: z.string().min(1),
  cards: z.array(templateCardSchema).default([]),
});

const boardDefaultsSchema = z.object({
  backgroundImage: z.string().min(1).optional(),
  backgroundBrightness: z.enum(["light", "dark"]).optional(),
  backgroundBottomColor: z.string().optional(),
  backgroundTopColor: z.string().optional(),
  backgroundColor: z.string().optional(),
});

export const boardTemplateDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  board: boardDefaultsSchema.optional(),
  lists: z.array(templateListSchema),
});

export type BoardTemplateDefinition = z.infer<
  typeof boardTemplateDefinitionSchema
>;

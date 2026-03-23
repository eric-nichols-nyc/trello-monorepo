import { z } from "zod";

export const createUserSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial().omit({
  clerkUserId: true,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

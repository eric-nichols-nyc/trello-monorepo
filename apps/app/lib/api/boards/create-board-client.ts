import { z } from "zod";

import { BoardApiError } from "@/lib/api/boards/board-api-error";

const createBoardRequestSchema = z
  .object({
    name: z.string().min(1, "name is required").trim(),
    workspaceId: z.string().uuid("workspaceId must be a valid UUID"),
    backgroundColor: z.string().min(1).optional(),
    backgroundImage: z.string().min(1).optional(),
  })
  .refine(
    (value) =>
      value.backgroundColor !== undefined || value.backgroundImage !== undefined,
    { message: "Choose a solid color or a photo background" }
  );

export type CreateBoardClientInput = z.infer<typeof createBoardRequestSchema>;

const createdBoardSchema = z.object({
  shortLink: z.string().min(1).nullable().optional(),
  id: z.string().uuid(),
});

export async function createBoardClient(
  input: CreateBoardClientInput
): Promise<{ boardKey: string }> {
  const parsed = createBoardRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.flatten().formErrors.join("; "));
  }

  const response = await fetch("/api/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }

  const raw: unknown = await response.json();
  const board = createdBoardSchema.safeParse(raw);
  if (!board.success) {
    throw new Error("Create board response was not valid");
  }

  const key = board.data.shortLink ?? board.data.id;
  return { boardKey: key };
}

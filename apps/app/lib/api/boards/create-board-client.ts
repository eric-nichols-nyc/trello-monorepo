import { z } from "zod";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

/** POST body when `templateId` is set — Nest expands the bundled template (lists/cards/background). */
const createBoardFromTemplateBodySchema = z.object({
  name: z.string().min(1, "name is required").trim(),
  workspaceId: z.string().uuid("workspaceId must be a valid UUID"),
  templateId: z.string().min(1, "templateId is required"),
});

const createBoardWithBackgroundBodySchema = z
  .object({
    name: z.string().min(1, "name is required").trim(),
    workspaceId: z.string().uuid("workspaceId must be a valid UUID"),
    backgroundColor: z.string().min(1).optional(),
    backgroundImage: z.string().min(1).optional(),
  })
  .refine(
    (v) => v.backgroundColor !== undefined || v.backgroundImage !== undefined,
    { message: "Choose a solid color or a photo background" }
  );

const requestSchema = z.union([
  createBoardFromTemplateBodySchema,
  createBoardWithBackgroundBodySchema,
]);

export type CreateBoardClientInput = z.infer<typeof requestSchema>;

const responseSchema = z.object({
  shortLink: z.string().min(1).nullable().optional(),
  id: z.string().uuid(),
});

/** POST `/api/boards` on Nest; pass `await useAuth().getToken()`. */
export async function createBoardClient(
  input: CreateBoardClientInput,
  token: string
): Promise<{ boardKey: string }> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.flatten().formErrors.join("; "));
  }

  const response = await fetch(`${nestPublicBaseUrl()}/api/boards`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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
  const board = responseSchema.safeParse(raw);
  if (!board.success) {
    throw new Error("Create board response was not valid");
  }

  return { boardKey: board.data.shortLink ?? board.data.id };
}

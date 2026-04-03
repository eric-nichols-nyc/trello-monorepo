import { z } from "zod";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

const catalogItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  backgroundImage: z.string().min(1).optional(),
});

const catalogSchema = z.array(catalogItemSchema);

export type BoardTemplateCatalogItem = z.infer<typeof catalogItemSchema>;

/** GET `/api/board-templates` on Nest; pass `await useAuth().getToken()`. */
export async function getBoardTemplatesClient(
  token: string
): Promise<BoardTemplateCatalogItem[]> {
  const response = await fetch(`${nestPublicBaseUrl()}/api/board-templates`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`
    );
  }

  const json: unknown = await response.json();
  return catalogSchema.parse(json);
}

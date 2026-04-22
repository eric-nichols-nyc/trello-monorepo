import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

import {
  type CardAttachmentResult,
  parseCardAttachmentResult,
} from "./post-card-attachment-client";

/** POST JSON `{ url, name? }` to `/api/cards/:id/attachments/link`. */
export async function postCardAttachmentLinkClient(
  cardId: string,
  body: { url: string; name?: string },
  token: string,
): Promise<CardAttachmentResult> {
  const response = await fetch(
    `${nestPublicBaseUrl()}/api/cards/${encodeURIComponent(cardId)}/attachments/link`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`,
    );
  }

  const raw: unknown = await response.json();
  return parseCardAttachmentResult(raw);
}

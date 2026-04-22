import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

/** Row returned by Nest after persisting an attachment (Prisma JSON). */
export type CardAttachmentResult = {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseCardAttachmentResult(raw: unknown): CardAttachmentResult {
  if (!isRecord(raw)) {
    throw new Error("Invalid attachment response");
  }
  const id = raw.id;
  const name = raw.name;
  const url = raw.url;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof url !== "string"
  ) {
    throw new Error("Invalid attachment response shape");
  }
  const mimeType = raw.mimeType;
  const sizeBytes = raw.sizeBytes;
  return {
    id,
    name,
    url,
    mimeType: typeof mimeType === "string" ? mimeType : null,
    sizeBytes: typeof sizeBytes === "number" ? sizeBytes : null,
  };
}

export type PostCardAttachmentOptions = {
  /** Optional display `name` (multipart field `name`); defaults to the file name. */
  readonly name?: string;
};

/** POST multipart fields `file` and optional `name` to `/api/cards/:id/attachments`. */
export async function postCardAttachmentClient(
  cardId: string,
  file: File,
  token: string,
  options?: PostCardAttachmentOptions,
): Promise<CardAttachmentResult> {
  const formData = new FormData();
  formData.append("file", file);
  const trimmed = options?.name?.trim();
  if (trimmed) {
    formData.append("name", trimmed);
  }

  const response = await fetch(
    `${nestPublicBaseUrl()}/api/cards/${encodeURIComponent(cardId)}/attachments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

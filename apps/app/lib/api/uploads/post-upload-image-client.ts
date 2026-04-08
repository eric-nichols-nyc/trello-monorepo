import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { nestPublicBaseUrl } from "@/lib/api/nest-public-base-url";

export type UploadImageResult = {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUploadImageResult(raw: unknown): UploadImageResult {
  if (!isRecord(raw)) {
    throw new Error("Invalid upload response");
  }
  const secureUrl = raw.secureUrl;
  const publicId = raw.publicId;
  const width = raw.width;
  const height = raw.height;
  const format = raw.format;
  if (
    typeof secureUrl !== "string" ||
    typeof publicId !== "string" ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    typeof format !== "string"
  ) {
    throw new Error("Invalid upload response shape");
  }
  return { secureUrl, publicId, width, height, format };
}

/** POST multipart `file` to `/api/uploads/image`; requires Clerk bearer token. */
export async function postUploadImageClient(
  file: File,
  token: string,
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${nestPublicBaseUrl()}/api/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new BoardApiError(
      response.status,
      `${response.status} ${await response.text()}`,
    );
  }

  const raw: unknown = await response.json();
  return parseUploadImageResult(raw);
}

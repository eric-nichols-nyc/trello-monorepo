import { notFound } from "next/navigation";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { getBoard } from "@/lib/api/boards/get-board";
import { normalizeBoardDetailPayload } from "@/types/board-detail";

import { BoardPageContent } from "../_components/board-page-content";

type BoardPageProperties = {
  params: Promise<{ id: string }>;
};

/**
 * Server load for SEO, `notFound()`, and first paint. The normalized board is
 * passed to `BoardPageContent`, which seeds TanStack Query via `useBoardDetail`.
 */
export default async function BoardPage({ params }: BoardPageProperties) {
  const { id } = await params;

  let raw: unknown;
  try {
    raw = await getBoard(id);
  } catch (error) {
    if (error instanceof BoardApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const initialBoard = normalizeBoardDetailPayload(raw);
  return <BoardPageContent boardKey={id} initialBoard={initialBoard} />;
}

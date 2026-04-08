"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { patchBoardClient } from "@/lib/api/boards/patch-board-client";
import {
  type BoardDetail,
  mergeBoardPatchResponseIntoDetail,
} from "@/types/board-detail";

import { boardDetailQueryKey } from "./board-detail-query";

export type UpdateBoardStarredVariables = {
  /** Board primary key for `PATCH /api/boards/:id`. */
  boardId: string;
  /** Route/cache key (`shortLink` or id) — must match `useBoardDetail`. */
  boardKey: string;
  starred: boolean;
};

type UpdateBoardStarredContext = {
  previous: BoardDetail | undefined;
};

/**
 * Persists `Board.starred` via Nest, merges into the board-detail cache when present,
 * and refreshes the Next.js router so server-rendered workspace board grids stay in sync.
 *
 * UI: `BoardHeaderStarButton` — `app/(workspace)/b/_components/BoardHeaderOptions/board-header-star-button.tsx`.
 */
export function useUpdateBoardStarred() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      boardId,
      starred,
    }: UpdateBoardStarredVariables) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return patchBoardClient(boardId, { starred }, token);
    },
    onMutate: async ({
      boardKey,
      starred,
    }): Promise<UpdateBoardStarredContext> => {
      const key = boardDetailQueryKey(boardKey);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<BoardDetail>(key);

      queryClient.setQueryData<BoardDetail>(key, (old) =>
        old ? { ...old, starred } : old,
      );

      return { previous };
    },
    onSuccess: (data, { boardKey }) => {
      const key = boardDetailQueryKey(boardKey);
      queryClient.setQueryData<BoardDetail>(key, (old) =>
        old ? mergeBoardPatchResponseIntoDetail(old, data) : old,
      );
    },
    onError: (_error, { boardKey }, context) => {
      const key = boardDetailQueryKey(boardKey);
      if (context?.previous !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

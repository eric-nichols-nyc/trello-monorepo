"use client";

import { useAuth } from "@repo/clerk/client";
import { useMutation } from "@tanstack/react-query";

import {
  createBoardClient,
  type CreateBoardClientInput,
} from "@/lib/api/boards/create-board-client";

/**
 * Authenticated `POST /api/boards` — blank board (color/photo) or `templateId` for Nest bundled templates.
 */
export function useCreateBoardMutation() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateBoardClientInput) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return createBoardClient(input, token);
    },
  });
}

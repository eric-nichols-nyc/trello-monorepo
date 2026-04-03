"use client";

import { useAuth } from "@repo/clerk/client";
import { useQuery } from "@tanstack/react-query";

import { getBoardTemplatesClient } from "@/lib/api/board-templates/get-board-templates-client";

import { boardTemplatesCatalogQueryKey } from "./board-templates-query";

const STALE_MS = 5 * 60 * 1000;

/**
 * TanStack Query wrapper for the Nest board template catalog (`GET /api/board-templates`).
 * Runs only when Clerk has finished loading and the user is signed in.
 */
export function useBoardTemplates() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: boardTemplatesCatalogQueryKey(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return getBoardTemplatesClient(token);
    },
    enabled: Boolean(isLoaded && isSignedIn),
    staleTime: STALE_MS,
  });

  return {
    ...query,
    authLoaded: isLoaded,
    isSignedIn: isSignedIn === true,
  };
}

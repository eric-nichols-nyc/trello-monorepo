"use client";

/**
 * Server-shaped {@link BoardDetail} → per-card lookup maps for list rows and
 * drag previews. Drag order / optimistic card positions stay in
 * {@link useBoardListsDrag}; this hook only reads `board.lists` (same source as
 * the server query) so props stay serializable `Record<cardId, …>` blobs.
 */

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import type { BoardDetail } from "@/types/board-detail";

/** Rolled-up checklist progress for {@link ListCard} badges (card omitted if no items). */
export type BoardListCardChecklistSummary = {
  completed: number;
  due: string | null;
  total: number;
};

/** Normalized cover fields for {@link ListCard} / {@link ListCardDragPreview}. */
export type BoardListCardCover = {
  coverColor: string | null;
  coverImage: string | null;
};

/**
 * Derives stable `Record<string, …>` maps from `board.lists` and a router helper
 * to open a card by id. All memos depend on `[board.lists]` so refetches that
 * replace list contents (same query key) refresh lookups without coupling to
 * drag-local `cardsByList` order.
 *
 * @returns Maps keyed by card id plus `handleOpenCard` for `/c/[shortLink|id]`.
 */
export function useBoardListsCardData(board: BoardDetail) {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // URL segment per card — shortLink when present, else raw id (encode on push).
  // ---------------------------------------------------------------------------
  const cardPathSegments = useMemo(() => {
    const map: Record<string, string> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        map[card.id] =
          card.shortLink.length > 0 ? card.shortLink : card.id;
      }
    }
    return map;
  }, [board.lists]);

  // Non-empty trimmed plaintext only (badges / description icon).
  const cardDescriptions = useMemo(() => {
    const map: Record<string, string> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        if (card.description == null) {
          continue;
        }
        const text = String(card.description).trim();
        if (text.length > 0) {
          map[card.id] = text;
        }
      }
    }
    return map;
  }, [board.lists]);

  // Omitted keys mean zero attachments — avoids passing `0` through every row.
  const cardAttachmentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        if (card.attachmentCount > 0) {
          map[card.id] = card.attachmentCount;
        }
      }
    }
    return map;
  }, [board.lists]);

  // Parsed `Date` for badge formatting; invalid server strings skipped.
  const cardDueDates = useMemo(() => {
    const map: Record<string, Date> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        if (card.dueDate == null || card.dueDate === "") {
          continue;
        }
        const d = new Date(card.dueDate);
        if (!Number.isNaN(d.getTime())) {
          map[card.id] = d;
        }
      }
    }
    return map;
  }, [board.lists]);

  // Same “omit when zero” pattern as attachments.
  const cardCommentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        const n = card.comments.length;
        if (n > 0) {
          map[card.id] = n;
        }
      }
    }
    return map;
  }, [board.lists]);

  // Flatten all checklist items on the card for a single progress ratio + due echo.
  const cardChecklists = useMemo(() => {
    const map: Record<string, BoardListCardChecklistSummary> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        let total = 0;
        let completed = 0;
        for (const checklist of card.checklists) {
          for (const item of checklist.items) {
            total += 1;
            if (item.completed) {
              completed += 1;
            }
          }
        }
        if (total > 0) {
          map[card.id] = {
            completed,
            due: card.dueDate,
            total,
          };
        }
      }
    }
    return map;
  }, [board.lists]);

  // Only cards with at least one visual cover field get an entry (saves lookups).
  const cardCovers = useMemo(() => {
    const map: Record<string, BoardListCardCover> = {};
    for (const list of board.lists) {
      for (const card of list.cards) {
        const img =
          card.coverImage != null && String(card.coverImage).trim() !== ""
            ? card.coverImage
            : null;
        const col =
          card.coverColor != null && String(card.coverColor).trim() !== ""
            ? card.coverColor
            : null;
        if (img !== null || col !== null) {
          map[card.id] = { coverColor: col, coverImage: img };
        }
      }
    }
    return map;
  }, [board.lists]);

  // Stable vs client-only reorder: segments come from server board, not drag state.
  const handleOpenCard = useCallback(
    (cardId: string) => {
      const segment = cardPathSegments[cardId];
      if (!segment) {
        return;
      }
      router.push(`/c/${encodeURIComponent(segment)}`);
    },
    [cardPathSegments, router]
  );

  return {
    // Exposed for callers that need the segment without navigating (e.g. copy link).
    cardPathSegments,
    cardDescriptions,
    cardAttachmentCounts,
    cardDueDates,
    cardCommentCounts,
    cardChecklists,
    cardCovers,
    handleOpenCard,
  };
}

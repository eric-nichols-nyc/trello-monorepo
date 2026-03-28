import type { CardOrderingRow } from "@repo/schemas";

export type CardDropPosition = "first" | "last" | "before" | "after";

export type CardPositionCalculatorParams = {
  cards: CardOrderingRow[];
  cardId: string;
  targetListId: string;
  dropPosition: CardDropPosition;
  /** Required when `dropPosition` is `before` or `after`. */
  targetCardId?: string;
};

export type CardPositionResult = {
  newPosition: number;
  needsRebalancing: boolean;
  /** Full card ordering rows after applying the move (and optional rebalance). */
  updatedCards: CardOrderingRow[];
};

/**
 * Fractional `pos` calculator for cards in lists (same idea as Trello / midpoint).
 * Operates on {@link CardOrderingRow} only — no Prisma or UI types.
 */
export class KanbanCardPositionCalculator {
  private static readonly REBALANCE_THRESHOLD = 0.001;
  private static readonly INITIAL_POSITION_GAP = 1000;

  static calculatePosition(
    params: CardPositionCalculatorParams
  ): CardPositionResult {
    const { cards, cardId, targetListId, dropPosition, targetCardId } = params;

    const columnCards = cards
      .filter((c) => c.listId === targetListId && c.id !== cardId)
      .sort((a, b) => a.pos - b.pos);

    let newPosition: number;
    let needsRebalancing = false;

    switch (dropPosition) {
      case "first": {
        newPosition = this.calculateFirstPosition(columnCards);
        break;
      }
      case "last": {
        newPosition = this.calculateLastPosition(columnCards);
        break;
      }
      case "before": {
        if (!targetCardId) {
          throw new Error('targetCardId is required for "before" position');
        }
        const beforeResult = this.calculateBeforePosition(
          columnCards,
          targetCardId
        );
        newPosition = beforeResult.position;
        needsRebalancing = beforeResult.needsRebalancing;
        break;
      }
      case "after": {
        if (!targetCardId) {
          throw new Error('targetCardId is required for "after" position');
        }
        const afterResult = this.calculateAfterPosition(
          columnCards,
          targetCardId
        );
        newPosition = afterResult.position;
        needsRebalancing = afterResult.needsRebalancing;
        break;
      }
    }

    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, listId: targetListId, pos: newPosition } : c
    );

    if (needsRebalancing) {
      return this.rebalanceColumn(updatedCards, targetListId, cardId);
    }

    return { newPosition, needsRebalancing: false, updatedCards };
  }

  /** `pos` for a new card at the end of a list (e.g. quick-add). */
  static getNewCardPosition(cards: CardOrderingRow[], listId: string): number {
    const columnCards = cards
      .filter((c) => c.listId === listId)
      .sort((a, b) => a.pos - b.pos);

    if (columnCards.length === 0) {
      return this.INITIAL_POSITION_GAP;
    }

    return columnCards[columnCards.length - 1].pos + this.INITIAL_POSITION_GAP;
  }

  private static calculateFirstPosition(columnCards: CardOrderingRow[]): number {
    if (columnCards.length === 0) {
      return this.INITIAL_POSITION_GAP;
    }
    return columnCards[0].pos / 2;
  }

  private static calculateLastPosition(columnCards: CardOrderingRow[]): number {
    if (columnCards.length === 0) {
      return this.INITIAL_POSITION_GAP;
    }
    return (
      columnCards[columnCards.length - 1].pos + this.INITIAL_POSITION_GAP
    );
  }

  private static calculateBeforePosition(
    columnCards: CardOrderingRow[],
    targetCardId: string
  ): { position: number; needsRebalancing: boolean } {
    const targetIndex = columnCards.findIndex((c) => c.id === targetCardId);
    if (targetIndex === -1) {
      throw new Error(`Target card ${targetCardId} not found`);
    }

    const targetCard = columnCards[targetIndex];

    if (targetIndex === 0) {
      return { position: targetCard.pos / 2, needsRebalancing: false };
    }

    const prevCard = columnCards[targetIndex - 1];
    const gap = targetCard.pos - prevCard.pos;

    if (gap <= this.REBALANCE_THRESHOLD) {
      return { position: targetCard.pos, needsRebalancing: true };
    }

    return {
      position: prevCard.pos + gap / 2,
      needsRebalancing: false,
    };
  }

  private static calculateAfterPosition(
    columnCards: CardOrderingRow[],
    targetCardId: string
  ): { position: number; needsRebalancing: boolean } {
    const targetIndex = columnCards.findIndex((c) => c.id === targetCardId);
    if (targetIndex === -1) {
      throw new Error(`Target card ${targetCardId} not found`);
    }

    const targetCard = columnCards[targetIndex];

    if (targetIndex === columnCards.length - 1) {
      return {
        position: targetCard.pos + this.INITIAL_POSITION_GAP,
        needsRebalancing: false,
      };
    }

    const nextCard = columnCards[targetIndex + 1];
    const gap = nextCard.pos - targetCard.pos;

    if (gap <= this.REBALANCE_THRESHOLD) {
      return { position: targetCard.pos, needsRebalancing: true };
    }

    return {
      position: targetCard.pos + gap / 2,
      needsRebalancing: false,
    };
  }

  private static rebalanceColumn(
    cards: CardOrderingRow[],
    listId: string,
    movedCardId?: string
  ): CardPositionResult {
    const columnCards = cards
      .filter((c) => c.listId === listId)
      .sort((a, b) => a.pos - b.pos);

    const rebalancedColumn = columnCards.map((c, index) => ({
      ...c,
      pos: (index + 1) * this.INITIAL_POSITION_GAP,
    }));

    const rebalancedById = new Map(rebalancedColumn.map((c) => [c.id, c]));

    const updatedCards = cards.map((c) => {
      if (c.listId !== listId) {
        return c;
      }
      return rebalancedById.get(c.id) ?? c;
    });

    const moved = movedCardId
      ? updatedCards.find((c) => c.id === movedCardId)
      : undefined;

    return {
      newPosition: moved?.pos ?? 0,
      needsRebalancing: true,
      updatedCards,
    };
  }
}

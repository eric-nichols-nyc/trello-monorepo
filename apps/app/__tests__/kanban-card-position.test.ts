import { KanbanCardPositionCalculator } from "@repo/card-positioning";
import { describe, expect, it } from "vitest";

describe("KanbanCardPositionCalculator", () => {
  it("places before the first card in the column using half of its pos", () => {
    const cards = [
      { id: "x", listId: "L0", pos: 100 },
      { id: "a", listId: "L1", pos: 1000 },
      { id: "b", listId: "L1", pos: 2000 },
    ];
    const result = KanbanCardPositionCalculator.calculatePosition({
      cards,
      cardId: "x",
      targetListId: "L1",
      dropPosition: "before",
      targetCardId: "a",
    });
    expect(result.newPosition).toBe(500);
    expect(result.needsRebalancing).toBe(false);
    const x = result.updatedCards.find((c) => c.id === "x");
    expect(x?.listId).toBe("L1");
  });

  it("appends with default gap when drop is last", () => {
    const cards = [
      { id: "x", listId: "L0", pos: 100 },
      { id: "a", listId: "L1", pos: 1000 },
    ];
    const result = KanbanCardPositionCalculator.calculatePosition({
      cards,
      cardId: "x",
      targetListId: "L1",
      dropPosition: "last",
    });
    expect(result.newPosition).toBe(2000);
  });
});

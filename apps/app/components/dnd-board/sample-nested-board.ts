import type { NestedBoardInitialState } from "./nested-board-types";

/** Two columns, a few cards, stable fractional list positions (1000 / 2000). */
export const SAMPLE_NESTED_BOARD: NestedBoardInitialState = {
  listIds: ["list-todo", "list-doing"],
  listTitles: {
    "list-todo": "To do",
    "list-doing": "Doing",
  },
  cardTitles: {
    "card-1": "Design reusable DnD shell",
    "card-2": "Wire Storybook",
    "card-3": "Ship",
  },
  cardsByList: {
    "list-todo": ["card-1", "card-2"],
    "list-doing": ["card-3"],
  },
  listPosById: {
    "list-todo": 1000,
    "list-doing": 2000,
  },
};

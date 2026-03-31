/** Serializable snapshot for the demo / Storybook board (not wired to routes). */
export type NestedBoardInitialState = {
  listIds: string[];
  cardsByList: Record<string, string[]>;
  listTitles: Record<string, string>;
  cardTitles: Record<string, string>;
  /**
   * Optional stored `List.pos` from a pretend server — drives
   * {@link suggestedListPositionsForOrder} in the debug readout.
   */
  listPosById?: Record<string, number>;
};

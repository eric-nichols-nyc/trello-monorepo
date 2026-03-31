"use client";

import { NestedBoardDemo } from "../../app/components/dnd-board/nested-board-demo";
import { SAMPLE_NESTED_BOARD } from "../../app/components/dnd-board/sample-nested-board";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Isolated nested board DnD (`apps/app/components/dnd-board`). Same `move()` flow
 * as production; uses `suggestedListPositionsForOrder` for the pos readout.
 */
const meta = {
  title: "app/DndBoard demo",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-[#1d2125] p-6">
      <p className="mb-4 max-w-xl text-sm text-white/70">
        Drag columns by the grip; drag cards by the card body. Green debug line
        shows stored list <code className="text-white/90">pos</code> vs
        suggested fractional pos from{" "}
        <code className="text-white/90">list-column-pos</code> for the current
        column order.
      </p>
      <NestedBoardDemo initial={SAMPLE_NESTED_BOARD} showListPosDebug />
    </div>
  ),
};

export const WithoutPosDebug: Story = {
  render: () => (
    <div className="min-h-screen bg-[#1d2125] p-6">
      <NestedBoardDemo initial={SAMPLE_NESTED_BOARD} showListPosDebug={false} />
    </div>
  ),
};

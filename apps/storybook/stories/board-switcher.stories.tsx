"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Card } from "@repo/design-system/components/ui/card";
import type { Meta, StoryObj } from "@storybook/react";
import Link from "next/link";
import { useState } from "react";
import { BoardSwitcherView } from "@/app/(workspace)/b/_components/BoardSwitcher/board-switcher-view";
import {
  getBoardId,
  getBoardStringField,
  getPreviewBackgroundStyle,
} from "@/lib/boards/board-list-utils";

const DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";

const mockWorkspaces = [
  {
    id: DEMO_WORKSPACE_ID,
    name: "Demo workspace",
    shortLink: null as string | null,
  },
] as const;

const mockBoards = [
  {
    id: "00000000-0000-4000-8000-000000000011",
    shortLink: "alpha",
    name: "Alpha board",
    workspaceId: DEMO_WORKSPACE_ID,
    workspaceName: "Demo workspace",
    starred: true,
    backgroundColor: "#5f5c9b",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000012",
    shortLink: "beta",
    name: "Beta roadmap",
    workspaceId: DEMO_WORKSPACE_ID,
    workspaceName: "Demo workspace",
    starred: false,
    backgroundTopColor: "#1a3d2e",
    backgroundBottomColor: "#0d1f18",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "00000000-0000-4000-8000-000000000013",
    shortLink: "gamma",
    name: "Gamma sprint",
    workspaceId: DEMO_WORKSPACE_ID,
    workspaceName: "Demo workspace",
    starred: false,
    backgroundColor: "#6b4c2a",
    updatedAt: new Date().toISOString(),
  },
];

/** Presentational tile — no React Query / star API (Storybook-only). */
function StorybookBoardSwitcherTile({ board }: { readonly board: unknown }) {
  const shortLink = getBoardStringField(board, "shortLink");
  const id = getBoardId(board);
  const name = getBoardStringField(board, "name");
  const workspaceLabel = getBoardStringField(board, "workspaceName");
  const title = name ?? shortLink ?? id;
  const boardKey = shortLink ?? id;
  const href = boardKey !== undefined ? `/b/${boardKey}` : null;
  const previewStyle = getPreviewBackgroundStyle(board);

  return (
    <div className="group relative">
      {href !== null ? (
        <Link
          aria-label={
            title !== undefined ? `Open board ${title}` : "Open board"
          }
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href={href}
        />
      ) : null}
      <Card className="relative z-1 h-[120px] gap-0 overflow-hidden rounded-xl border border-black/15 bg-transparent py-0 shadow-sm transition-shadow hover:shadow-md dark:border-white/15">
        <div
          className="relative h-[86px] w-full shrink-0 bg-center bg-cover"
          style={previewStyle}
        >
          {workspaceLabel !== undefined ? (
            <div className="absolute bottom-2 left-2 rounded border border-white/20 bg-black/40 px-2 py-0.5 font-medium text-[11px] text-white leading-tight shadow-md backdrop-blur-sm">
              {workspaceLabel}
            </div>
          ) : null}
        </div>
        <div className="flex h-[34px] shrink-0 items-center bg-[#1f1f1f] px-3 dark:bg-[#1a1a1a]">
          {title !== undefined ? (
            <p className="truncate font-medium text-[15px] text-white leading-snug">
              {title}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

const meta = {
  title: "app/BoardSwitcher",
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/b/alpha",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function BoardSwitcherDemo({
  initiallyOpen = true,
  currentBoardKey = "alpha",
}: {
  readonly initiallyOpen?: boolean;
  readonly currentBoardKey?: string;
}) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <div className="dark min-h-screen bg-[#1d2125] p-6 text-white">
      <p className="mb-4 max-w-md text-sm text-white/70">
        Uses <code className="text-white/90">BoardSwitcherView</code> with mock
        workspace data and a story-only tile (no React Query). Overlay portals
        to <code className="text-white/90">document.body</code>.
      </p>
      <Button onClick={() => setOpen(true)} type="button" variant="secondary">
        Open board switcher
      </Button>
      <BoardSwitcherView
        boards={mockBoards}
        boardTileComponent={StorybookBoardSwitcherTile}
        currentBoardKey={currentBoardKey}
        onClose={() => setOpen(false)}
        open={open}
        pathname={`/b/${currentBoardKey}`}
        workspaceSummaries={mockWorkspaces}
      />
    </div>
  );
}

export const Open: Story = {
  render: () => <BoardSwitcherDemo initiallyOpen />,
};

export const Closed: Story = {
  render: () => <BoardSwitcherDemo initiallyOpen={false} />,
};

export const CurrentBoardBeta: Story = {
  name: "Current board: beta",
  render: () => <BoardSwitcherDemo currentBoardKey="beta" initiallyOpen />,
};

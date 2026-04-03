"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import { MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

type PlaceholderActivity = {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: ReactNode;
  showReply?: boolean;
};

const PLACEHOLDER_ACTIVITY: PlaceholderActivity[] = [
  {
    id: "1",
    author: "Eric Nichols",
    initials: "EN",
    time: "54 minutes ago",
    showReply: true,
    body: (
      <>
        set this card to be due tomorrow at <strong>9:28 AM</strong>
      </>
    ),
  },
  {
    id: "2",
    author: "Eric Nichols",
    initials: "EN",
    time: "1 hour ago",
    body: <>removed the due date from this card</>,
  },
  {
    id: "3",
    author: "Eric Nichols",
    initials: "EN",
    time: "Feb 11, 2026, 9:47 PM",
    showReply: true,
    body: (
      <>
        attached <strong>spec-notes.pdf</strong> to this card
      </>
    ),
  },
  {
    id: "4",
    author: "Alex Kim",
    initials: "AK",
    time: "Yesterday",
    showReply: true,
    body: <>Can we prioritize this for the next release?</>,
  },
  {
    id: "5",
    author: "Sam Rivera",
    initials: "SR",
    time: "Mar 28, 2026",
    body: <>moved this card from <strong>Backlog</strong> to <strong>In progress</strong></>,
  },
];

export type CardBackCommentsProps = {
  className?: string;
};

export function CardBackComments({ className }: CardBackCommentsProps) {
  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col bg-zinc-950/80 lg:bg-zinc-900/60",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-zinc-800 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare aria-hidden className="size-4 text-zinc-500" />
          <h2 className="font-semibold text-sm text-zinc-100">
            Comments and activity
          </h2>
        </div>
        <Button
          className="h-8 text-zinc-400 hover:text-zinc-100"
          size="sm"
          type="button"
          variant="ghost"
        >
          Hide details
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        <Textarea
          className="min-h-[72px] resize-none border-zinc-800 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-500"
          placeholder="Write a comment..."
        />

        <ul className="flex flex-col gap-6">
          {PLACEHOLDER_ACTIVITY.map((item) => (
            <li className="flex gap-3" key={item.id}>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-medium text-white text-xs">
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200">
                  <span className="font-semibold text-zinc-100">
                    {item.author}
                  </span>{" "}
                  {item.body}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{item.time}</p>
                {item.showReply ? (
                  <button
                    className="mt-1 text-xs text-zinc-500 hover:text-zinc-300"
                    type="button"
                  >
                    Reply
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

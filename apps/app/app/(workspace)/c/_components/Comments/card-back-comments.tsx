"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import dynamic from "next/dynamic";
import { MessageSquare, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { toast } from "@/lib/toast";
import { useCreateCardComment } from "@/queries/use-create-card-comment";
import {
  normalizeBoardComment,
  type BoardComment,
  type BoardCommentAuthor,
} from "@/types/board-detail";

const TinyMCEEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false },
);

function textFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function hasMeaningfulComment(html: string): boolean {
  return html.trim() !== "" && textFromHtml(html) !== "";
}

function authorDisplayName(author: BoardCommentAuthor): string {
  const fn = author.firstName?.trim() ?? "";
  const ln = author.lastName?.trim() ?? "";
  if (fn || ln) {
    return [fn, ln].filter(Boolean).join(" ");
  }
  const email = author.email?.trim() ?? "";
  if (email) {
    return email.split("@")[0] ?? email;
  }
  return "Member";
}

function authorInitials(author: BoardCommentAuthor): string {
  const fn = author.firstName?.trim() ?? "";
  const ln = author.lastName?.trim() ?? "";
  if (fn && ln) {
    return (fn[0] + ln[0]).toUpperCase();
  }
  if (fn.length >= 2) {
    return fn.slice(0, 2).toUpperCase();
  }
  const email = author.email?.trim() ?? "";
  if (email.length >= 2) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

function formatCommentTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return "";
  }
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 45) {
    return "just now";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h ago`;
  }
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) {
    return `${diffDay}d ago`;
  }
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: then < now - 365 * 24 * 60 * 60 * 1000 ? "numeric" : undefined,
  });
}

export type CardBackCommentsProps = {
  className?: string;
  cardId: string;
  boardRouteKey: string;
  initialComments: BoardComment[];
  panelOpen: boolean;
  onPanelOpenChange: (open: boolean) => void;
};

export function CardBackComments({
  className,
  cardId,
  boardRouteKey,
  initialComments,
  panelOpen = false,
  onPanelOpenChange,
}: CardBackCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const commentsFingerprint = useMemo(
    () => initialComments.map((c) => c.id).join("|"),
    [initialComments],
  );

  useEffect(() => {
    setComments(initialComments);
  }, [commentsFingerprint, initialComments]);

  const createMutation = useCreateCardComment();

  const closeEditor = useCallback(() => {
    setDraft("");
    setEditorKey((k) => k + 1);
    setIsEditorOpen(false);
  }, []);

  const toggleEditor = useCallback(() => {
    if (isEditorOpen) {
      closeEditor();
    } else {
      setIsEditorOpen(true);
    }
  }, [closeEditor, isEditorOpen]);

  useEffect(() => {
    if (!panelOpen) {
      closeEditor();
    }
  }, [panelOpen, closeEditor]);

  const handleSave = useCallback(() => {
    if (!hasMeaningfulComment(draft)) {
      return;
    }
    const text = draft.trim();
    createMutation.mutate(
      { cardId, boardRouteKey, text },
      {
        onSuccess: (data) => {
          const next = normalizeBoardComment(data);
          setComments((prev) =>
            prev.some((c) => c.id === next.id) ? prev : [...prev, next],
          );
          closeEditor();
          toast.success("Comment posted");
        },
      },
    );
  }, [boardRouteKey, cardId, closeEditor, createMutation, draft]);

  const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col bg-zinc-950/80 lg:bg-zinc-900/60",
        panelOpen
          ? className
          : "max-h-[52px] shrink-0 overflow-hidden border-zinc-800 border-t lg:max-h-none lg:w-12 lg:min-w-12 lg:max-w-12 lg:border-t-0 lg:border-l lg:shrink-0",
      )}
    >
      {panelOpen ? (
        <>
          <div className="flex shrink-0 items-center border-zinc-800 border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <MessageSquare aria-hidden className="size-4 shrink-0 text-zinc-500" />
              <h2 className="font-semibold text-sm text-zinc-100">
                Comments and activity
              </h2>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="space-y-2">
              <Button
                className={cn(
                  "flex w-full items-start justify-start border-zinc-700 bg-zinc-800 py-3 text-left text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200",
                  isEditorOpen ? "min-h-10" : "h-auto min-h-14",
                )}
                onClick={toggleEditor}
                size="sm"
                type="button"
                variant="outline"
              >
                <Pencil className="mr-2 mt-0.5 size-4 shrink-0" />
                {isEditorOpen ? "Close editor" : "Make a comment"}
              </Button>
              {isEditorOpen ? (
                <>
                  <TinyMCEEditor
                    key={editorKey}
                    apiKey={tinymceApiKey}
                    value={draft}
                    onEditorChange={setDraft}
                    init={{
                      height: 140,
                      menubar: false,
                      branding: false,
                      skin: "oxide-dark",
                      content_css: "dark",
                      plugins: ["lists", "link"],
                      toolbar:
                        "undo redo | bold italic | bullist numlist | link",
                      content_style:
                        "body { font-family: inherit; font-size: 13px; color: #e4e4e7; }",
                      placeholder: "Write a comment...",
                      entity_encoding: "raw",
                    }}
                  />
                  <Button
                    disabled={
                      createMutation.isPending ||
                      !hasMeaningfulComment(draft)
                    }
                    onClick={handleSave}
                    size="sm"
                    type="button"
                  >
                    {createMutation.isPending ? "Posting…" : "Save comment"}
                  </Button>
                </>
              ) : null}
            </div>

            {comments.length === 0 ? (
              <p className="text-center text-sm text-zinc-500">
                No comments yet. Be the first to comment.
              </p>
            ) : (
              <ul className="flex flex-col gap-6">
                {comments.map((item) => (
                  <li className="flex gap-3" key={item.id}>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-medium text-white text-xs">
                      {authorInitials(item.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200">
                        <span className="font-semibold text-zinc-100">
                          {authorDisplayName(item.author)}
                        </span>
                      </p>
                      <div
                        className="mt-1 prose prose-sm prose-invert max-w-none text-zinc-300 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-a:text-(--app-blue-accent)"
                        dangerouslySetInnerHTML={{ __html: item.text }}
                      />
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatCommentTime(item.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <button
          aria-expanded={false}
          aria-label={`Make a comment${comments.length > 0 ? `, ${comments.length} existing comments` : ""}`}
          className="flex min-h-[52px] flex-1 touch-manipulation items-center justify-center gap-2 px-2 text-zinc-400 transition-colors hover:bg-zinc-800/80 hover:text-zinc-100 lg:min-h-0 lg:flex-col lg:justify-start lg:gap-3 lg:py-6"
          onClick={() => onPanelOpenChange(true)}
          type="button"
        >
          <Pencil aria-hidden className="size-5 shrink-0 text-zinc-500" />
          <span className="font-medium text-xs lg:[writing-mode:vertical-rl] lg:rotate-180">
            Make a comment
          </span>
          {comments.length > 0 ? (
            <span className="tabular-nums text-[11px] text-zinc-500 lg:order-first lg:[writing-mode:vertical-rl] lg:rotate-180">
              {comments.length}
            </span>
          ) : null}
        </button>
      )}
    </aside>
  );
}

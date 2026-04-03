"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import { Progress } from "@repo/design-system/components/ui/progress";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import {
  AlignLeft,
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  Circle,
  Image,
  MessageSquare,
  MoreHorizontal,
  Plug,
  Plus,
  Square,
  Tag,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { BoardCard } from "@/types/board-detail";

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

type CardRouteDetailProps = {
  boardRouteKey: string;
  card: BoardCard;
  listName: string;
  boardName: string;
  mode: "modal" | "page";
};

function flattenChecklists(card: BoardCard): ChecklistItem[] {
  const rows: ChecklistItem[] = [];
  const lists = [...card.checklists].sort((a, b) => a.pos - b.pos);
  for (const cl of lists) {
    const items = [...cl.items].sort((a, b) => a.pos - b.pos);
    for (const it of items) {
      rows.push({
        id: it.id,
        text: it.name,
        completed: it.completed,
      });
    }
  }
  return rows;
}

function formatDueLabel(iso: string | null): string | null {
  if (iso === null) {
    return null;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function dueSoonLabel(dueIso: string | null): string | null {
  if (dueIso === null) {
    return null;
  }
  const due = new Date(dueIso).getTime();
  if (Number.isNaN(due)) {
    return null;
  }
  const now = Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  if (due > now && due - now < twoDays) {
    return "Due soon";
  }
  if (due < now) {
    return "Overdue";
  }
  return null;
}

type CardBackPanelProps = {
  boardRouteKey: string;
  card: BoardCard;
  listName: string;
  boardName: string;
  mode: "modal" | "page";
  onRequestClose: () => void;
};

function CardBackPanel({
  boardRouteKey,
  card,
  listName,
  boardName,
  mode,
  onRequestClose,
}: CardBackPanelProps) {
  const backHref = `/b/${encodeURIComponent(boardRouteKey)}`;

  const [description, setDescription] = useState(card.description ?? "");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() =>
    flattenChecklists(card)
  );
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    setDescription(card.description ?? "");
    setChecklistItems(flattenChecklists(card));
    setIsAddingItem(false);
    setNewItemText("");
  }, [card.id, card.updatedAt]);

  const completedCount = useMemo(
    () => checklistItems.filter((item) => item.completed).length,
    [checklistItems]
  );
  const progress = useMemo(
    () =>
      checklistItems.length > 0
        ? (completedCount / checklistItems.length) * 100
        : 0,
    [checklistItems.length, completedCount]
  );

  const dueLabel = formatDueLabel(card.dueDate);
  const dueBadge = dueSoonLabel(card.dueDate);

  const addChecklistItem = useCallback(() => {
    const t = newItemText.trim();
    if (t.length > 0) {
      setChecklistItems((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, text: t, completed: false },
      ]);
      setNewItemText("");
      setIsAddingItem(false);
    }
  }, [newItemText]);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const deleteChecklist = useCallback(() => {
    setChecklistItems([]);
  }, []);

  const titleClass =
    "font-semibold text-2xl text-zinc-100 leading-none tracking-tight";

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-zinc-900 text-zinc-100 shadow-2xl">
      <div className="flex items-center justify-between border-zinc-800 border-b px-4 py-3">
        <Button
          className="gap-1 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          size="sm"
          type="button"
          variant="ghost"
        >
          {listName}
          <ChevronDown className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Image className="size-5" />
          </Button>
          <Button
            className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal className="size-5" />
          </Button>
          {mode === "modal" ? (
            <Button
              aria-label="Close card"
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={onRequestClose}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X className="size-5" />
            </Button>
          ) : (
            <Button
              asChild
              className="size-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              size="icon-sm"
              variant="ghost"
            >
              <Link aria-label="Back to board" href={backHref}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-[min(70vh,720px)] overflow-y-auto p-6">
        <p className="mb-4 text-sm text-zinc-500">
          {boardName} · {listName}
        </p>

        <div className="mb-6 flex items-center gap-3">
          <Circle className="size-6 text-zinc-500" />
          {mode === "modal" ? (
            <DialogTitle className={titleClass}>{card.name}</DialogTitle>
          ) : (
            <h1 className={titleClass}>{card.name}</h1>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            className="gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="size-4" />
            Add
          </Button>
          <Button
            className="gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            size="sm"
            type="button"
            variant="outline"
          >
            <Tag className="size-4" />
            Labels
          </Button>
          <Button
            className="gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            size="sm"
            type="button"
            variant="outline"
          >
            <CheckSquare className="size-4" />
            Checklist
          </Button>
          <Button
            className="gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            size="sm"
            type="button"
            variant="outline"
          >
            <Users className="size-4" />
            Members
          </Button>
        </div>

        {dueLabel !== null ? (
          <div className="mb-6">
            <p className="mb-2 text-sm text-zinc-400">Due date</p>
            <Button
              className="gap-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              type="button"
              variant="ghost"
            >
              {dueLabel}
              {dueBadge !== null ? (
                <Badge
                  className={cn(
                    "border-0 hover:bg-yellow-500",
                    dueBadge === "Overdue"
                      ? "bg-red-500 text-red-950 hover:bg-red-500"
                      : "bg-yellow-500 text-yellow-950"
                  )}
                >
                  {dueBadge}
                </Badge>
              ) : null}
              <ChevronDown className="size-4" />
            </Button>
          </div>
        ) : null}

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <AlignLeft className="size-5 text-zinc-400" />
            <h2 className="font-semibold text-zinc-100">Description</h2>
          </div>
          <Textarea
            className="min-h-24 resize-none border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
            value={description}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="size-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-100">Checklist</h2>
            </div>
            <Button
              className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={deleteChecklist}
              size="sm"
              type="button"
              variant="outline"
            >
              Delete
            </Button>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-zinc-400">
              {Math.round(progress)}%
            </span>
            <Progress className="h-2 flex-1 bg-zinc-700" value={progress} />
          </div>

          {checklistItems.map((item) => (
            <div className="mb-2 flex items-center gap-3" key={item.id}>
              <button
                className="text-zinc-400 hover:text-zinc-200"
                onClick={() => toggleChecklistItem(item.id)}
                type="button"
              >
                {item.completed ? (
                  <CheckSquare className="size-5 text-green-500" />
                ) : (
                  <Square className="size-5" />
                )}
              </button>
              <span
                className={
                  item.completed
                    ? "text-zinc-500 line-through"
                    : "text-zinc-200"
                }
              >
                {item.text}
              </span>
            </div>
          ))}

          {isAddingItem ? (
            <div className="mt-3 space-y-2">
              <input
                autoFocus
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addChecklistItem();
                  }
                }}
                placeholder="Add an item"
                type="text"
                value={newItemText}
              />
              <div className="flex gap-2">
                <Button
                  className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  onClick={addChecklistItem}
                  size="sm"
                  type="button"
                >
                  Add
                </Button>
                <Button
                  className="text-zinc-400 hover:text-zinc-200"
                  onClick={() => {
                    setIsAddingItem(false);
                    setNewItemText("");
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="mt-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setIsAddingItem(true)}
              size="sm"
              type="button"
              variant="outline"
            >
              Add an item
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 border-zinc-800 border-t px-4 py-3">
        <Button
          className="gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          size="sm"
          type="button"
          variant="ghost"
        >
          <Plug className="size-4" />
          Power-ups
        </Button>
        <div className="h-4 w-px bg-zinc-700" />
        <Button
          className="gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          size="sm"
          type="button"
          variant="ghost"
        >
          <Zap className="size-4" />
          Automations
        </Button>
        <div className="h-4 w-px bg-zinc-700" />
        <Button
          className="gap-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          size="sm"
          type="button"
          variant="ghost"
        >
          <MessageSquare className="size-4" />
          Comments
        </Button>
      </div>
    </div>
  );
}

export function TrellnodeCardBack({
  boardRouteKey,
  card,
  listName,
  boardName,
  mode,
}: CardRouteDetailProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (mode === "modal") {
    return (
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          }
        }}
        open
      >
        <DialogContent
          className="top-[50px] max-h-[calc(100vh-50px-1rem)] w-full max-w-2xl translate-x-[-50%] translate-y-0 gap-0 overflow-y-auto border-zinc-800 bg-transparent p-0 text-zinc-100 shadow-none sm:max-w-2xl"
          showCloseButton={false}
        >
          <CardBackPanel
            boardRouteKey={boardRouteKey}
            boardName={boardName}
            card={card}
            listName={listName}
            mode="modal"
            onRequestClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
        <Link
          className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
          href={`/b/${encodeURIComponent(boardRouteKey)}`}
        >
          ← Back to board
        </Link>
        <CardBackPanel
          boardRouteKey={boardRouteKey}
          boardName={boardName}
          card={card}
          listName={listName}
          mode="page"
          onRequestClose={handleClose}
        />
      </div>
    </div>
  );
}

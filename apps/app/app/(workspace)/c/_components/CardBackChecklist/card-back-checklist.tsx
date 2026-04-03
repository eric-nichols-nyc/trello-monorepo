"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Progress } from "@repo/design-system/components/ui/progress";
import { CheckSquare, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { BoardCard } from "@/types/board-detail";

type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type CardBackChecklistProps = {
  card: BoardCard;
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

export function CardBackChecklist({ card }: CardBackChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() =>
    flattenChecklists(card)
  );
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
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

  return (
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
        <span className="text-sm text-zinc-400">{Math.round(progress)}%</span>
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
              item.completed ? "text-zinc-500 line-through" : "text-zinc-200"
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
  );
}

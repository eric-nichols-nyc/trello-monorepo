"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useUpdateBoard } from "@/queries/use-update-board";
import { useCallback, useEffect, useRef, useState } from "react";

type BoardNameProperties = {
  readonly boardId: string;
  readonly boardKey: string;
  readonly name: string;
};

/**
 * Click to edit. **Enter** or **blur** (including from click-outside) commits via
 * `useUpdateBoard` when the trimmed name changed. **Escape** discards edits.
 * Click-outside blurs the input so commit logic lives only in `commitOnBlur`.
 */
export const BoardName = ({
  boardId,
  boardKey,
  name,
}: BoardNameProperties) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const containerReference = useRef<HTMLDivElement>(null);
  const draftReference = useRef(draft);
  const nameReference = useRef(name);

  draftReference.current = draft;
  nameReference.current = name;

  const updateBoard = useUpdateBoard();

  useEffect(() => {
    if (!isEditing) {
      setDraft(name);
    }
  }, [name, isEditing]);

  const startEditing = () => {
    setDraft(name);
    setIsEditing(true);
  };

  const cancelWithoutSave = () => {
    setDraft(nameReference.current);
    setIsEditing(false);
  };

  const commitOnBlur = useCallback(() => {
    if (updateBoard.isPending) {
      return;
    }

    const trimmed = draftReference.current.trim();
    const currentName = nameReference.current.trim();

    if (trimmed === "") {
      setDraft(nameReference.current);
      setIsEditing(false);
      return;
    }

    if (trimmed === currentName) {
      setIsEditing(false);
      return;
    }

    updateBoard.mutate(
      { boardId, boardKey, updates: { name: trimmed } },
      {
        onError: () => {
          setDraft(nameReference.current);
        },
        onSettled: () => {
          setIsEditing(false);
        },
      }
    );
  }, [boardId, boardKey, updateBoard]);

  useClickOutside(
    containerReference,
    () => {
      const root = containerReference.current;
      const active = document.activeElement;
      if (
        root &&
        active instanceof HTMLInputElement &&
        root.contains(active)
      ) {
        active.blur();
      }
    },
    isEditing
  );

  if (isEditing) {
    return (
      <div className="min-w-48 max-w-full" ref={containerReference}>
        <Input
          aria-label="Board name"
          autoFocus
          className={cn(
            "h-auto w-full min-w-0 border-white/25 bg-black/25 py-1.5 font-bold text-foreground text-xl shadow-none md:text-2xl",
            "focus-visible:border-white/40 focus-visible:ring-white/30"
          )}
          disabled={updateBoard.isPending}
          onBlur={commitOnBlur}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelWithoutSave();
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              (event.currentTarget as HTMLInputElement).blur();
            }
          }}
          value={draft}
        />
      </div>
    );
  }

  return (
    <button
      className={cn(
        "max-w-full cursor-pointer truncate rounded-sm px-1 py-0.5 text-left font-bold text-foreground text-xl transition-colors",
        "hover:bg-black/15 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring",
        "md:text-2xl"
      )}
      disabled={updateBoard.isPending}
      onClick={startEditing}
      type="button"
    >
      {name}
    </button>
  );
};

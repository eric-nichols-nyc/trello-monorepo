"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useUpdateBoard } from "@/queries/use-update-board";

type BoardNameProperties = {
  readonly boardId: string;
  readonly boardKey: string;
  readonly name: string;
};

/**
 * Click the title to show a rename form (input) and hide the static label.
 * **Enter** (form submit) or **blur** (including click-outside) commits via
 * `useUpdateBoard` when the trimmed name changed. **Escape** discards edits.
 */
export const BoardName = ({ boardId, boardKey, name }: BoardNameProperties) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const containerReference = useRef<HTMLFormElement>(null);
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
        onError: (error) => {
          setDraft(nameReference.current);
          // Temporary UX until toast notifications exist.
          // biome-ignore lint/suspicious/noAlert: user-requested error surface for failed rename
          globalThis.alert(
            error instanceof Error
              ? error.message
              : "Could not update the board name."
          );
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
      if (root && active instanceof HTMLInputElement && root.contains(active)) {
        active.blur();
      }
    },
    isEditing
  );

  if (isEditing) {
    return (
      <form
        autoComplete="off"
        className="min-w-48 max-w-full"
        onSubmit={(event) => {
          event.preventDefault();
          const input = containerReference.current?.querySelector("input");
          if (input instanceof HTMLInputElement) {
            input.blur();
          }
        }}
        ref={containerReference}
      >
        <Input
          aria-label="Board name"
          autoComplete="off"
          autoFocus
          className={cn(
            "h-auto w-full min-w-0 border-white/25 bg-black/25 py-1.5 font-bold text-foreground text-xl shadow-none md:text-2xl",
            "focus-visible:border-white/40 focus-visible:ring-white/30"
          )}
          disabled={updateBoard.isPending}
          name="trellnode-board-title"
          onBlur={commitOnBlur}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelWithoutSave();
            }
          }}
          value={draft}
        />
      </form>
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

"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useUpdateList } from "@/queries/use-update-list";

const LIST_ID_PREFIX = /^list-/;

export function listTitleFromId(id: string): string {
  return `List ${id.replace(LIST_ID_PREFIX, "")}`;
}

type ListTitleProps = {
  title: string;
  /** When set with `boardKey`, the title is clickable to rename via PATCH. */
  listId?: string;
  boardKey?: string;
};

const titleTypography = "text-sm font-semibold text-white/90";

const titleReadOnlyClass = cn("min-w-0 flex-1 truncate", titleTypography);

function ListTitleEditable({
  boardKey,
  listId,
  title,
}: {
  boardKey: string;
  listId: string;
  title: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const formReference = useRef<HTMLFormElement>(null);
  const draftReference = useRef(draft);
  const titleReference = useRef(title);

  draftReference.current = draft;
  titleReference.current = title;

  const updateList = useUpdateList();

  useEffect(() => {
    if (!isEditing) {
      setDraft(title);
    }
  }, [title, isEditing]);

  const startEditing = () => {
    setDraft(title);
    setIsEditing(true);
  };

  const cancelWithoutSave = () => {
    setDraft(titleReference.current);
    setIsEditing(false);
  };

  const commitOnBlur = useCallback(() => {
    if (updateList.isPending) {
      return;
    }

    const trimmed = draftReference.current.trim();
    const currentTitle = titleReference.current.trim();

    if (trimmed === "") {
      setDraft(titleReference.current);
      setIsEditing(false);
      return;
    }

    if (trimmed === currentTitle) {
      setIsEditing(false);
      return;
    }

    updateList.mutate(
      { listId, boardKey, updates: { name: trimmed } },
      {
        onError: (error) => {
          setDraft(titleReference.current);
          // biome-ignore lint/suspicious/noAlert: temporary until toasts exist
          globalThis.alert(
            error instanceof Error
              ? error.message
              : "Could not update the list name."
          );
        },
        onSettled: () => {
          setIsEditing(false);
        },
      }
    );
  }, [boardKey, listId, updateList]);

  useClickOutside(
    formReference,
    () => {
      const root = formReference.current;
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
        className={cn("min-w-0 flex-1", titleTypography)}
        onSubmit={(event) => {
          event.preventDefault();
          const input = formReference.current?.querySelector("input");
          if (input instanceof HTMLInputElement) {
            input.blur();
          }
        }}
        ref={formReference}
      >
        <Input
          aria-label="List name"
          autoFocus
          className={cn(
            "h-8 w-full min-w-0 border-white/25 bg-black/30 py-1 font-semibold text-sm text-white shadow-none",
            "focus-visible:border-white/40 focus-visible:ring-white/25"
          )}
          disabled={updateList.isPending}
          name="listName"
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
        titleReadOnlyClass,
        "max-w-full cursor-pointer rounded-sm px-1 py-0.5 text-left transition-colors",
        "hover:bg-white/10 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/30"
      )}
      disabled={updateList.isPending}
      onClick={startEditing}
      type="button"
    >
      {title}
    </button>
  );
}

export const ListTitle = ({ boardKey, listId, title }: ListTitleProps) => {
  if (listId === undefined || boardKey === undefined) {
    return <span className={titleReadOnlyClass}>{title}</span>;
  }

  return (
    <ListTitleEditable boardKey={boardKey} listId={listId} title={title} />
  );
};

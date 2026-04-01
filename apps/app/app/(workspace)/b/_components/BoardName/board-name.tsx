"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import {  type KeyboardEventHandler, type FocusEventHandler, useCallback, useEffect, useRef, useState } from "react";
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
  //const [draft, setDraft] = useState(name);
  const containerReference = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // const draftReference = useRef(draft);
  // const nameReference = useRef(name);

  // draftReference.current = draft;
  // nameReference.current = name;

  const boardName = name;


  const updateBoard = useUpdateBoard();

  // useEffect(() => {
  //   if (!isEditing) {
  //     setDraft(name);
  //   }
  // }, [name, isEditing]);

  const startEditing = () => {
    //setDraft(name);
    setIsEditing(true);
  };

  const cancelWithoutSave = () => {
    //setDraft(nameReference.current);
    setIsEditing(false);
  };

    /**
   * Resizes the board name input up to the maximum width of the board header. Currently,
   * this gets the board header width via a document query, but once the board header is
   * completely in react should be done via a passed ref instead
   */
    const resizeInput = useCallback(() => {
      if (!inputRef?.current) {
        return;
      }
      inputRef.current.style.width = '0';
      let inputWidthForNewValue = inputRef.current.offsetWidth;

      inputRef.current.scrollLeft = 1e10;
      // With the width set to zero and the input scrolled to the end of the content, the element's
      // scrollLeft value is the width of the content! Now we add that to the offset.
      inputWidthForNewValue += inputRef.current.scrollLeft;

      // Here we make sure the input doesn't fall off the side of the page. The "-24" is for padding.
      // eslint-disable-next-line @trello/no-query-selector
      const boardHeader = document.querySelector<HTMLElement>('.js-board-header');
      const headerOffsetWidth = boardHeader?.offsetWidth;
      const maxWidth = (headerOffsetWidth || 1e10) - 24;

      const inputWidth =
        inputWidthForNewValue < maxWidth ? inputWidthForNewValue : maxWidth;
      // Now we have an input that's only as wide as the content needs, without running off the page.
      inputRef.current.style.width = inputWidth + 'px';
    }, [inputRef]);


  const commitOnBlur:FocusEventHandler<HTMLInputElement>  = useCallback((e) => {
    if (updateBoard.isPending) {
      return;
    }

    const newBoardName = e.currentTarget.value.trim();

    if (!newBoardName || newBoardName === '') {
      if (inputRef.current) {
        inputRef.current.value = boardName || '';
      }
      setIsEditing(false);
      return;
    }

    setIsEditing(false);

    if (newBoardName === boardName) {
      return;
    }

    updateBoard.mutate(
      { boardId, boardKey, updates: { name: newBoardName } },
      {
        onError: (error) => {
          //setDraft(boardName);
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

    // Pressing Enter submits the name change
    const onInputKeyUp: KeyboardEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      },
      [],
    );

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
          inputRef.current?.blur();
        }}
        ref={containerReference}
      >
        <Input
          ref={inputRef}
          aria-label="Board name"
          autoComplete="off"
          autoFocus
          className={cn(
            "h-auto w-auto min-w-0 border-white/25 bg-black/25 py-1.5 font-bold text-foreground text-lg shadow-none md:text-xl",
            "focus-visible:border-white/40 focus-visible:ring-white/30"
          )}
          disabled={updateBoard.isPending}
          name="trellnode-board-title"
          onBlur={commitOnBlur}
          onFocus={resizeInput}
          onInput={resizeInput}
          //onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              cancelWithoutSave();
            }
          }}
          onKeyUp={onInputKeyUp}
          defaultValue={boardName}
        />
      </form>
    );
  }

  return (
    <button
      className={cn(
        "max-w-full cursor-pointer truncate rounded-sm px-1 py-0.5 text-left font-bold text-foreground text-lg transition-colors",
        "hover:bg-white/15 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring",
        "md:text-xl"
      )}
      disabled={updateBoard.isPending}
      onClick={startEditing}
      type="button"
    >
      {name}
    </button>
  );
};

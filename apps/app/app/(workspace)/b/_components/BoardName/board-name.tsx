"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import {
  type FocusEventHandler,
  type KeyboardEventHandler,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  const containerReference = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** Width of the title button measured before swap to input (avoids unmount). */
  const widthSeedFromButtonRef = useRef<number | null>(null);

  const boardName = name;

  const updateBoard = useUpdateBoard();

  const startEditing = () => {
    const button = buttonRef.current;
    widthSeedFromButtonRef.current = button
      ? Math.round(button.getBoundingClientRect().width)
      : null;
    setIsEditing(true);
  };

  const cancelWithoutSave = () => {
    setIsEditing(false);
  };

  /**
   * Sizes the input to its text, capped by the board header. Uses the pre-edit button width
   * as a floor so the field matches the clicked title (incl. truncate). Header width: document
   * query until the header exposes a ref.
   */
  const resizeInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    input.style.width = "0";
    let contentWidth = input.offsetWidth;
    input.scrollLeft = 1e10;
    contentWidth += input.scrollLeft;

    // eslint-disable-next-line @trello/no-query-selector
    const boardHeader = document.querySelector<HTMLElement>(".js-board-header");
    const maxWidth = (boardHeader?.offsetWidth ?? Number.POSITIVE_INFINITY) - 24;

    const seed = widthSeedFromButtonRef.current;
    const withSeed =
      seed !== null ? Math.max(contentWidth, seed) : contentWidth;
    const inputWidth = Math.min(withSeed, maxWidth);
    input.style.width = `${inputWidth}px`;
  }, []);

  useLayoutEffect(() => {
    if (!isEditing) {
      widthSeedFromButtonRef.current = null;
      return;
    }
    resizeInput();
  }, [isEditing, resizeInput]);


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
            "h-auto w-auto min-w-0 border-white/25 bg-black/25 px-1 py-0 font-bold text-foreground text-lg shadow-none md:text-xl",
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
      ref={buttonRef}
      className={cn(
        "max-w-full cursor-pointer truncate rounded-sm px-1 py-0.5 text-left font-bold text-foreground text-lg transition-colors",
        "hover:bg-white/15 focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
      )}
      disabled={updateBoard.isPending}
      onClick={startEditing}
      type="button"
    >
      {name}
    </button>
  );
};

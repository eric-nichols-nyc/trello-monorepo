"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useRef } from "react";

/** Matches {@link LIST_CARD_SURFACE_CLASSNAME} so the title band fully covers the checkbox when collapsed. */
const TITLE_MASK_BG = "bg-[rgb(36,37,40)]";

export type ListCardCompletionControl = {
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (value: boolean | "indeterminate") => void;
};

export type ListCardTitleProps = {
  title: string;
  className?: string;
  /** Right padding so title text clears the card actions trigger. @default true */
  contentGutterForEdit?: boolean;
  /** Card checkbox “done” — strikethrough on the list face. */
  completed?: boolean;
  /**
   * Completion checkbox: unchecked state sits under the title; card `group-hover` /
   * `group-focus-within` slides the title aside to reveal it (checked stays revealed).
   */
  completion?: ListCardCompletionControl;
  /** Inline rename: form with input + Save; submit on Enter or Save. */
  editMode?: boolean;
  draftTitle?: string;
  onDraftTitleChange?: (value: string) => void;
  onTitleFormSubmit?: () => void;
  onTitleEditCancel?: () => void;
  titleSavePending?: boolean;
};

export function listCardContentRevealTranslateClass(
  completed: boolean
): string {
  return completed === true
    ? "translate-x-6"
    : "translate-x-0 group-hover:translate-x-6 group-focus-within:translate-x-6";
}

export function ListCardTitle({
  title,
  className,
  contentGutterForEdit = true,
  completed = false,
  completion,
  editMode = false,
  draftTitle = "",
  onDraftTitleChange,
  onTitleFormSubmit,
  onTitleEditCancel,
  titleSavePending = false,
}: ListCardTitleProps) {
  const showCheckbox = completion !== undefined;
  const revealClass =
    showCheckbox === false
      ? null
      : listCardContentRevealTranslateClass(completed);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode) {
      const id = requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.select();
        }
      });
      return () => cancelAnimationFrame(id);
    }
  }, [editMode]);

  return (
    <div
      className={cn(
        "relative min-w-0 flex-1",
        contentGutterForEdit === true ? "pr-7" : null,
        className
      )}
    >
      {showCheckbox ? (
        <span
          className={cn(
            "-translate-y-1/2 absolute top-1/2 left-0 z-1 transition-opacity duration-150",
            completion.checked
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            aria-label={`Mark card complete: ${title}`}
            checked={completion.checked}
            className={cn(
              "list-card-completion-checkbox size-4 rounded-full border border-white/35 bg-transparent shadow-none",
              "[&_[data-slot=checkbox-indicator]_svg]:size-3.5"
            )}
            disabled={completion.disabled}
            onCheckedChange={completion.onCheckedChange}
          />
        </span>
      ) : null}
      <div
        className={cn(
          "relative z-2 min-h-4 min-w-0 transition-transform duration-200 ease-out",
          showCheckbox ? TITLE_MASK_BG : null,
          editMode ? "translate-x-0" : revealClass
        )}
      >
        {editMode ? (
          <form
            className="flex min-w-0 items-center gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              onTitleFormSubmit?.();
            }}
          >
            <Input
              ref={inputRef}
              aria-label="Card title"
              className={cn(
                "h-8 min-w-0 flex-1 border-white/15 bg-white/5 py-1 text-sm text-white shadow-none",
                "focus-visible:border-[#8AB4F8] focus-visible:ring-2 focus-visible:ring-[#8AB4F8]/35"
              )}
              disabled={titleSavePending}
              onChange={(event) => {
                onDraftTitleChange?.(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.stopPropagation();
                  onTitleEditCancel?.();
                }
              }}
              value={draftTitle}
            />
            <Button
              className="h-8 shrink-0 px-2.5 text-xs"
              disabled={titleSavePending}
              type="submit"
              variant="secondary"
            >
              Save
            </Button>
          </form>
        ) : (
          <span
            className={cn(
              "block truncate font-medium text-white/85 text-sm",
              completed ? "text-white/45 line-through" : null
            )}
          >
            {title}
          </span>
        )}
      </div>
    </div>
  );
}

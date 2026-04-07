"use client";

import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";

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
};

export function listCardContentRevealTranslateClass(completed: boolean): string {
  return completed === true
    ? "translate-x-7"
    : "translate-x-0 group-hover:translate-x-7 group-focus-within:translate-x-7";
}

export function ListCardTitle({
  title,
  className,
  contentGutterForEdit = true,
  completed = false,
  completion,
}: ListCardTitleProps) {
  const showCheckbox = completion !== undefined;
  const revealClass =
    showCheckbox === false ? null : listCardContentRevealTranslateClass(completed);

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
            "-translate-y-1/2 absolute top-1/2 left-0 z-[1] transition-opacity duration-150",
            completion.checked
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          )}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            aria-label={`Mark card complete: ${title}`}
            checked={completion.checked}
            className="size-5 rounded-full border-white/35 bg-transparent data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-600 [&_[data-slot=checkbox-indicator]_svg]:size-[18px]"
            disabled={completion.disabled}
            onCheckedChange={completion.onCheckedChange}
          />
        </span>
      ) : null}
      <div
        className={cn(
          "relative z-[2] min-h-5 min-w-0 transition-transform duration-200 ease-out",
          showCheckbox ? TITLE_MASK_BG : null,
          revealClass
        )}
      >
        <span
          className={cn(
            "block truncate font-medium text-white/85 text-xs",
            completed && "text-white/45 line-through"
          )}
        >
          {title}
        </span>
      </div>
    </div>
  );
}

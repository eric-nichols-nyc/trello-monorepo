"use client";

import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { cn } from "@repo/design-system/lib/utils";

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
  /** Renders the completion checkbox (list card only); fixed leading column matches Trello-style layout. */
  completion?: ListCardCompletionControl;
};

export function ListCardTitle({
  title,
  className,
  contentGutterForEdit = true,
  completed = false,
  completion,
}: ListCardTitleProps) {
  const showCheckbox = completion !== undefined;

  return (
    <div
      className={cn(
        "relative z-2 flex min-w-0 flex-1 items-center gap-2",
        contentGutterForEdit === true ? "pr-7" : null,
        className
      )}
    >
      {showCheckbox ? (
        <div className="flex size-5 shrink-0 items-center justify-center">
          <span
            className={cn(
              "flex transition-opacity duration-150",
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
        </div>
      ) : null}
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium text-white/85 text-xs",
          completed && "text-white/45 line-through"
        )}
      >
        {title}
      </span>
    </div>
  );
}

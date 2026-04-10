"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Calendar } from "@repo/design-system/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { X } from "lucide-react";
import { type RefObject, useId, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

/** Marks the portaled panel so parent menus can ignore “outside” clicks on it. */
export const EDIT_DATES_PANEL_ATTR = "data-card-edit-dates-panel";

export function isWithinEditDatesPanel(target: EventTarget | null): boolean {
  return (
    typeof Element !== "undefined" &&
    target instanceof Element &&
    target.closest(`[${EDIT_DATES_PANEL_ATTR}]`) !== null
  );
}

export type EditDatesPanelProps = {
  readonly position: { left: number; top: number };
  readonly onClose: () => void;
  /** Clicks on this subtree (e.g. the anchor trigger) do not count as outside. */
  readonly ignorePointerOutsideRef?: RefObject<HTMLElement | null>;
};

function formatDueDateDisplay(date: Date | undefined): string {
  if (date === undefined) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
}

export function EditDatesPanel({
  position,
  onClose,
  ignorePointerOutsideRef,
}: EditDatesPanelProps) {
  const dueDateInputId = useId();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const panelReference = useRef<HTMLDivElement>(null);

  useClickOutside(
    panelReference,
    onClose,
    true,
    ignorePointerOutsideRef ? [ignorePointerOutsideRef] : undefined
  );

  return (
    <div
      ref={panelReference}
      {...{ [EDIT_DATES_PANEL_ATTR]: "" }}
      aria-label="Edit dates"
      aria-modal="true"
      className={cn(
        "fixed z-200 flex w-[min(100vw-1rem,320px)] select-text flex-col rounded-xl border border-zinc-600/80 bg-zinc-800 text-zinc-100 shadow-lg"
      )}
      onPointerDown={(event) => event.stopPropagation()}
      role="dialog"
      style={{ left: position.left, top: position.top }}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden rounded-none border-0 bg-transparent py-0 text-inherit shadow-none"
        )}
      >
        <div className="relative flex items-center justify-center border-zinc-600/80 border-b px-10 py-3">
          <CardTitle className="text-center font-semibold text-base text-zinc-100">
            Dates
          </CardTitle>
          <Button
            aria-label="Close"
            className={cn(
              "-translate-y-1/2 absolute top-1/2 right-1.5 size-8 shrink-0 rounded-md",
              "text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100",
              "focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/80"
            )}
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X aria-hidden className="size-4" />
          </Button>
        </div>
        <CardContent className="space-y-3 px-4 pt-3 pb-3">
          <div className="flex flex-col gap-1.5">
            <label
              className="font-semibold text-xs text-zinc-400"
              htmlFor={dueDateInputId}
            >
              Due date
            </label>
            <Input
              aria-readonly="true"
              className="h-9 border-zinc-600 bg-zinc-900 text-zinc-100 selection:bg-zinc-600 selection:text-white placeholder:text-zinc-500 read-only:cursor-text focus-visible:border-zinc-500 focus-visible:ring-zinc-500/40"
              id={dueDateInputId}
              placeholder="No due date"
              readOnly
              tabIndex={0}
              value={formatDueDateDisplay(selectedDate)}
            />
          </div>
          <Calendar
            className="w-full rounded-lg border border-zinc-600/80 bg-zinc-900/90 p-2 text-zinc-100 [--cell-size:2rem]"
            classNames={{
              today:
                "rounded-md bg-white/10 text-white data-[selected=true]:rounded-none [&_button]:text-white [&_button:hover]:text-white [&_button:hover]:bg-white/10 dark:[&_button:hover]:text-white",
            }}
            mode="single"
            onSelect={setSelectedDate}
            selected={selectedDate}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-zinc-600/80 border-t px-4 pt-3 pb-4">
          <Button className="w-full" type="button" variant="secondary">
            Save
          </Button>
          <Button className="w-full" type="button" variant="destructive">
            Remove
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

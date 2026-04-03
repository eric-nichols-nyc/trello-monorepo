"use client";

/**
 * Workspace header “Create” entry: {@link Popover} with a root menu, then stacked screens
 * (`create-board` | `template`) via {@link StackedPopoverProvider}. Opening the popover bumps
 * `menuGeneration` so the stack resets to the menu each time. Surfaces use
 * `--card-back-actions-menu-bg` from `app/styles.css`; drop shadow is on {@link PopoverContent}.
 */

import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import { Kanban, LayoutTemplate } from "lucide-react";
import { type ComponentProps, useCallback, useState } from "react";
import {
  StackedPopoverHeader,
  StackedPopoverProvider,
  StackedPopoverRoot,
  StackedPopoverScreen,
  useStackedPopover,
} from "@/components/stacked-popover/stacked-popover";
import { CreateBoardForm } from "../create-board-popover/create-board-form";
import { CreateBoardHeader } from "../create-board-popover/create-board-header";

type HeaderCreateStackedPopoverProps = {
  /** Merged onto the Create trigger {@link Button} (e.g. layout). */
  className?: string;
  /** Disables the Create trigger; wins over `triggerProps.disabled` when set. */
  disabled?: boolean;
  /** When true, the “Start with a template” row is non-interactive. */
  templateDisabled?: boolean;
  /** Extra props for the trigger; must not set `children`, `type`, or `variant`. */
  triggerProps?: Omit<
    ComponentProps<typeof Button>,
    "children" | "type" | "variant"
  >;
  /** Passed to {@link CreateBoardForm}; null blocks submit until a workspace exists. */
  readonly workspaceId: string | null;
};

/** Stacked screen `create-board`: hero header + {@link CreateBoardForm}. */
function HeaderCreateBoardScreen({
  onBoardCreated,
  workspaceId,
}: {
  onBoardCreated: () => void;
  workspaceId: string | null;
}) {
  const { pop } = useStackedPopover();

  return (
    <div className="bg-(--card-back-actions-menu-bg)">
      <CreateBoardHeader onClose={pop} />
      <div className="px-4 py-4">
        <CreateBoardForm onCreated={onBoardCreated} workspaceId={workspaceId} />
      </div>
    </div>
  );
}

/**
 * Root menu: pushes `create-board` or `template` onto the stacked popover.
 * @param templateDisabled - Disables the template row (see {@link HeaderCreateStackedPopoverProps.templateDisabled}).
 */
function ExampleCreateMenuItems({
  templateDisabled = false,
}: {
  templateDisabled?: boolean;
}) {
  const { push } = useStackedPopover();

  return (
    <div className="flex flex-col gap-0.5 bg-(--card-back-actions-menu-bg) p-1.5">
      <Button
        className="h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-md p-3 text-left font-normal hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-sky-500/80"
        onClick={() => push("create-board")}
        type="button"
        variant="ghost"
      >
        <Kanban
          aria-hidden
          className="mt-0.5 size-6 shrink-0 text-foreground"
          strokeWidth={1.5}
        />
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-semibold text-foreground text-sm">
            Create board
          </span>
          <span className="mt-1 block wrap-break-word text-muted-foreground text-xs leading-snug">
            A board is made up of cards ordered on lists. Use it to manage
            projects, track information, or organize anything.
          </span>
        </span>
      </Button>
      <Button
        className="h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-md p-3 text-left font-normal hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-sky-500/80 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
        disabled={templateDisabled}
        onClick={() => push("template")}
        type="button"
        variant="ghost"
      >
        <LayoutTemplate
          aria-hidden
          className="mt-0.5 size-6 shrink-0 text-foreground"
          strokeWidth={1.5}
        />
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-semibold text-foreground text-sm">
            Start with a template
          </span>
          <span className="mt-1 block wrap-break-word text-muted-foreground text-xs leading-snug">
            Get started faster with a board template.
          </span>
        </span>
      </Button>
    </div>
  );
}

/**
 * Header “Create” control: menu → create board flow or template placeholder.
 *
 * @param workspaceId - Required for board creation; form gates submit when missing.
 */
export function HeaderCreateStackedPopover({
  className,
  disabled,
  templateDisabled = false,
  triggerProps,
  workspaceId,
}: HeaderCreateStackedPopoverProps) {
  const {
    className: triggerClassName,
    disabled: triggerDisabled,
    ...restTrigger
  } = triggerProps ?? {};

  const isDisabled = disabled ?? triggerDisabled;

  const [open, setOpen] = useState(false);
  const [menuGeneration, setMenuGeneration] = useState(0);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) {
      setMenuGeneration((g) => g + 1);
    }
  }, []);

  const handleBoardCreated = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(className, triggerClassName)}
          data-testid="header-create-button"
          disabled={isDisabled}
          type="button"
          variant="default"
          {...restTrigger}
        >
          Create
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[min(90dvh,720px)] w-[min(calc(100vw-2rem),22rem)] overflow-y-auto p-0 shadow-2xl ring-1 ring-black/25"
      >
        <StackedPopoverProvider key={menuGeneration}>
          <StackedPopoverRoot>
            <StackedPopoverHeader
              className="bg-(--card-back-actions-menu-bg)"
              title="New Board"
            />
            <ExampleCreateMenuItems templateDisabled={templateDisabled} />
          </StackedPopoverRoot>
          <StackedPopoverScreen id="create-board">
            <HeaderCreateBoardScreen
              onBoardCreated={handleBoardCreated}
              workspaceId={workspaceId}
            />
          </StackedPopoverScreen>
          <StackedPopoverScreen id="template">
            <StackedPopoverHeader title="Templates" />
            <div className="p-3 text-muted-foreground text-sm">
              Example: template gallery placeholder.
            </div>
          </StackedPopoverScreen>
        </StackedPopoverProvider>
      </PopoverContent>
    </Popover>
  );
}

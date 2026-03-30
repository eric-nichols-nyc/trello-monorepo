"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
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
  className?: string;
  /** Disables the Create trigger; overrides `triggerProps.disabled` when set. */
  disabled?: boolean;
  /**
   * “Start with a template” row. Defaults to disabled (greyed, not clickable) until you pass `false`.
   */
  templateDisabled?: boolean;
  triggerProps?: Omit<
    ComponentProps<typeof Button>,
    "children" | "type" | "variant"
  >;
  readonly workspaceId: string | null;
};

function HeaderCreateBoardScreen({
  onBoardCreated,
  workspaceId,
}: {
  onBoardCreated: () => void;
  workspaceId: string | null;
}) {
  const { pop } = useStackedPopover();

  return (
    <>
      <CreateBoardHeader onClose={pop} />
      <div className="px-4 py-4">
        <CreateBoardForm onCreated={onBoardCreated} workspaceId={workspaceId} />
      </div>
    </>
  );
}

function ExampleCreateMenuItems({
  templateDisabled = true,
}: {
  templateDisabled?: boolean;
}) {
  const { push } = useStackedPopover();

  return (
    <div className="flex flex-col gap-0.5 p-1">
      <Button
        className="w-full justify-start font-normal"
        onClick={() => push("create-board")}
        type="button"
        variant="ghost"
      >
        Create board
      </Button>
      <Button
        className="w-full justify-start font-normal disabled:text-muted-foreground disabled:hover:bg-transparent"
        disabled={templateDisabled}
        onClick={() => push("template")}
        type="button"
        variant="ghost"
      >
        Start with a template
      </Button>
    </div>
  );
}

/**
 * Header “Create” control with stacked drill-down (create board uses {@link CreateBoardForm}).
 */
export function HeaderCreateStackedPopover({
  className,
  disabled,
  templateDisabled = true,
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
        className="max-h-[min(90dvh,720px)] w-72 overflow-y-auto p-0"
      >
        <StackedPopoverProvider key={menuGeneration}>
          <StackedPopoverRoot>
            <StackedPopoverHeader title="New Board" />
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

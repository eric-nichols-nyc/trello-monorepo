"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { cn } from "@repo/design-system/lib/utils";
import type { ComponentProps } from "react";
import {
  StackedPopoverHeader,
  StackedPopoverProvider,
  StackedPopoverRoot,
  StackedPopoverScreen,
  useStackedPopover,
} from "@/components/stacked-popover/stacked-popover";

type HeaderCreateStackedPopoverProps = {
  className?: string;
  triggerProps?: Omit<
    ComponentProps<typeof Button>,
    "children" | "type" | "variant"
  >;
};

function ExampleCreateMenuItems() {
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
        className="w-full justify-start font-normal"
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
 * Header “Create” control with stacked drill-down (placeholder flows until real flows exist).
 */
export function HeaderCreateStackedPopover({
  className,
  triggerProps,
}: HeaderCreateStackedPopoverProps) {
  const { className: triggerClassName, ...restTrigger } = triggerProps ?? {};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(className, triggerClassName)}
          data-testid="header-create-button"
          type="button"
          variant="default"
          {...restTrigger}
        >
          Create
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <StackedPopoverProvider>
          <StackedPopoverRoot>
            <StackedPopoverHeader title="Create" />
            <ExampleCreateMenuItems />
          </StackedPopoverRoot>
          <StackedPopoverScreen id="create-board">
            <StackedPopoverHeader title="Create board" />
            <div className="space-y-2 p-3 text-sm">
              <p className="text-muted-foreground">
                Example: board name, workspace, background — wire forms here
                later.
              </p>
              <Button
                className="w-full"
                size="sm"
                type="button"
                variant="secondary"
              >
                Placeholder submit
              </Button>
            </div>
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

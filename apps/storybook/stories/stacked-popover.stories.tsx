import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import type { Meta, StoryObj } from "@storybook/react";
import {
  StackedPopoverHeader,
  StackedPopoverProvider,
  StackedPopoverRoot,
  StackedPopoverScreen,
  useStackedPopover,
} from "../../app/components/stacked-popover/stacked-popover";

/**
 * Drill-down navigation inside a surface (e.g. popover): root list → screen → back.
 * Lives in the app package; this story imports it via the monorepo relative path.
 */
const meta = {
  title: "app/StackedPopover",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function CreateBoardDemo() {
  const { push } = useStackedPopover();

  return (
    <div className="flex flex-col gap-1 p-1">
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

export const InsidePopover: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          Open stacked menu
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <StackedPopoverProvider>
          <StackedPopoverRoot>
            <StackedPopoverHeader title="New board" />
            <CreateBoardDemo />
          </StackedPopoverRoot>
          <StackedPopoverScreen id="create-board">
            <StackedPopoverHeader title="Create board" />
            <div className="space-y-2 p-3 text-sm">
              <p className="text-muted-foreground">
                Draft: name your board and pick a workspace.
              </p>
              <Button className="w-full" size="sm" type="button">
                Continue
              </Button>
            </div>
          </StackedPopoverScreen>
          <StackedPopoverScreen id="template">
            <StackedPopoverHeader title="Templates" />
            <div className="p-3 text-muted-foreground text-sm">
              Template gallery would go here.
            </div>
          </StackedPopoverScreen>
        </StackedPopoverProvider>
      </PopoverContent>
    </Popover>
  ),
};

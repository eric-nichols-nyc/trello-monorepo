"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { useState } from "react";
import { TemplateGallery } from "../TemplateGallery/template-gallery";

type StartWithTemplatePopoverProps = {
  readonly workspaceId: string | null;
};

export function StartWithTemplatePopover({
  workspaceId,
}: StartWithTemplatePopoverProps) {
  const [templateOpen, setTemplateOpen] = useState(false);

  return (
    <Popover onOpenChange={setTemplateOpen} open={templateOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="secondary">
          Start with a template
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-[min(90dvh,720px)] w-[min(calc(100vw-2rem),22rem)] overflow-y-auto p-0 shadow-2xl ring-1 ring-black/25"
        side="right"
        sideOffset={10}
      >
        <div className="bg-(--card-back-actions-menu-bg)">
          <TemplateGallery
            onBoardCreated={() => {
              setTemplateOpen(false);
            }}
            workspaceId={workspaceId}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

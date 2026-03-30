"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

import { CardQuickAddForm } from "./card-quick-add-form";
import { CardQuickAddTrigger } from "./card-quick-add-trigger";

type CardQuickAddProperties = {
  readonly boardKey: string;
  readonly listId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const CardQuickAdd = ({
  boardKey,
  listId,
  onOpenChange,
  open,
}: CardQuickAddProperties) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => onOpenChange(false), open);

  if (open) {
    return (
      <div ref={containerRef}>
        <CardQuickAddForm
          boardKey={boardKey}
          listId={listId}
          onClose={() => onOpenChange(false)}
        />
      </div>
    );
  }

  return <CardQuickAddTrigger onClick={() => onOpenChange(true)} />;
};

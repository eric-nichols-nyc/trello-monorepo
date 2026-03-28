"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

import { CardQuickAddForm } from "./card-quick-add-form";
import { CardQuickAddTrigger } from "./card-quick-add-trigger";

type CardQuickAddProperties = {
  readonly boardKey: string;
  readonly listId: string;
};

export const CardQuickAdd = ({ boardKey, listId }: CardQuickAddProperties) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  if (open) {
    return (
      <div ref={containerRef}>
        <CardQuickAddForm
          boardKey={boardKey}
          listId={listId}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  }

  return <CardQuickAddTrigger onClick={() => setOpen(true)} />;
};

"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { useRef, useState } from "react";

import { CardQuickAddForm } from "./card-quick-add-form";
import { CardQuickAddTrigger } from "./card-quick-add-trigger";

export const CardQuickAdd = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  if (open) {
    return (
      <div ref={containerRef}>
        <CardQuickAddForm onClose={() => setOpen(false)} />
      </div>
    );
  }

  return <CardQuickAddTrigger onClick={() => setOpen(true)} />;
};

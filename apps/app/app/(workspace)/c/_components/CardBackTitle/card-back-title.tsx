"use client";

import { DialogTitle } from "@repo/design-system/components/ui/dialog";
import { Circle } from "lucide-react";

export type CardBackTitleProps = {
  title: string;
  mode: "modal" | "page";
};

const titleClass =
  "font-semibold text-2xl text-zinc-100 leading-none tracking-tight";

export function CardBackTitle({ title, mode }: CardBackTitleProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Circle className="size-6 text-zinc-500" />
      {mode === "modal" ? (
        <DialogTitle className={titleClass}>{title}</DialogTitle>
      ) : (
        <h1 className={titleClass}>{title}</h1>
      )}
    </div>
  );
}

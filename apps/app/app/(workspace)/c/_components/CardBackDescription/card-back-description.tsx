"use client";

import { Textarea } from "@repo/design-system/components/ui/textarea";
import { AlignLeft } from "lucide-react";

export type CardBackDescriptionProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CardBackDescription({
  value,
  onChange,
}: CardBackDescriptionProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <AlignLeft className="size-5 text-zinc-400" />
        <h2 className="font-semibold text-zinc-100">Description</h2>
      </div>
      <Textarea
        className="min-h-24 resize-none border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a more detailed description..."
        value={value}
      />
    </div>
  );
}

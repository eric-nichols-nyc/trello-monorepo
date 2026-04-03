"use client";

import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { CheckSquare, Plus, Tag, Users } from "lucide-react";

const outlineChipClass =
  "gap-2 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100";

export type CardLabelChip = {
  id: string;
  name: string;
};

export type CardBackQuickAddProps = {
  labels?: readonly CardLabelChip[];
};

export function CardBackQuickAdd({ labels = [] }: CardBackQuickAddProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          className={outlineChipClass}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="size-4" />
          Add
        </Button>
        <Button
          className={outlineChipClass}
          size="sm"
          type="button"
          variant="outline"
        >
          <Tag className="size-4" />
          Labels
        </Button>
        <Button
          className={outlineChipClass}
          size="sm"
          type="button"
          variant="outline"
        >
          <CheckSquare className="size-4" />
          Checklist
        </Button>
        <Button
          className={outlineChipClass}
          size="sm"
          type="button"
          variant="outline"
        >
          <Users className="size-4" />
          Members
        </Button>
      </div>

      {labels.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Badge
              className="border-zinc-600 bg-zinc-800 font-normal text-zinc-200 hover:bg-zinc-700"
              key={label.id}
              variant="outline"
            >
              {label.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

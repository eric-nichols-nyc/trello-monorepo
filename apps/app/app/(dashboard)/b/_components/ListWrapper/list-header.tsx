import { GripVertical } from "lucide-react";
import type { HTMLAttributes } from "react";

import { ListTitle } from "./list-title";

type ListHeaderProps = {
  title: string;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
};

export const ListHeader = ({ title, dragHandleProps }: ListHeaderProps) => (
  <header className="mx-[4px] flex h-[32px] items-center gap-1 pt-[8px] pr-[8px] pl-[8px]">
    <button
      type="button"
      className="-ml-1 flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white/80 active:cursor-grabbing"
      aria-label="Drag list"
      {...dragHandleProps}
    >
      <GripVertical className="size-4 shrink-0" aria-hidden />
    </button>
    <ListTitle title={title} />
  </header>
);

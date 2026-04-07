import { cn } from "@repo/design-system/lib/utils";

type ListCardTitleProps = {
  title: string;
  className?: string;
  /** Card checkbox “done” — strikethrough on the list face. */
  completed?: boolean;
};

export const ListCardTitle = ({
  title,
  className,
  completed = false,
}: ListCardTitleProps) => (
  <span
    className={cn(
      "block min-w-0 truncate font-medium text-white/85 text-xs",
      completed && "text-white/45 line-through",
      className,
    )}
  >
    {title}
  </span>
);

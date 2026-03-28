import { cn } from "@repo/design-system/lib/utils";

type ListCardTitleProps = {
  title: string;
  className?: string;
};

export const ListCardTitle = ({ title, className }: ListCardTitleProps) => (
  <span
    className={cn(
      "block min-w-0 truncate font-medium text-white/85 text-xs",
      className
    )}
  >
    {title}
  </span>
);

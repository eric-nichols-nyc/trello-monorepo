type ListCardTitleProps = {
  title: string;
};

export const ListCardTitle = ({ title }: ListCardTitleProps) => (
  <span className="block min-w-0 truncate text-xs font-medium text-white/85">
    {title}
  </span>
);

export function listTitleFromId(id: string): string {
  return `List ${id.replace(/^list-/, "")}`;
}

type ListTitleProps = {
  title: string;
};

export const ListTitle = ({ title }: ListTitleProps) => (
  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90">
    {title}
  </span>
);

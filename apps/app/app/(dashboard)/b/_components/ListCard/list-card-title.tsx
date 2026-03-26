export function listCardTitleFromListId(
  listId: string,
  cardIndex: number,
): string {
  const listNum = listId.replace(/^list-/, "");
  return `list ${listNum} c${cardIndex}`;
}

type ListCardTitleProps = {
  listId: string;
  cardIndex: number;
};

export const ListCardTitle = ({ listId, cardIndex }: ListCardTitleProps) => (
  <span className="min-w-0 truncate text-xs font-medium text-white/85">
    {listCardTitleFromListId(listId, cardIndex)}
  </span>
);

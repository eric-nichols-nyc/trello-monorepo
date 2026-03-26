import { ListCardTitle } from "./list-card-title";

type ListCardProps = {
  listId: string;
  cardIndex: number;
};

export const ListCard = ({ listId, cardIndex }: ListCardProps) => (
  <li className="flex h-[45px] items-center rounded-[8px] bg-[rgb(36,37,40)] px-3">
    <ListCardTitle listId={listId} cardIndex={cardIndex} />
  </li>
);

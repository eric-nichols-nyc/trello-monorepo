import { ListCard } from "../ListCard/list-card";

type ListCardsProps = {
  listId: string;
};

const cardIndices = [1, 2, 3, 4, 5];

export const ListCards = ({ listId }: ListCardsProps) => (
  <ol className="mx-[4px] my-0 flex list-none flex-col gap-2 p-0">
    {cardIndices.map((cardIndex) => (
      <ListCard key={cardIndex} listId={listId} cardIndex={cardIndex} />
    ))}
  </ol>
);

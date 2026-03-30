import { CardQuickAdd } from "../CardQuickAdd/card-quick-add";

type ListFooterProperties = {
  readonly boardKey: string;
  readonly listId: string;
};

export const ListFooter = ({ boardKey, listId }: ListFooterProperties) => (
  <footer className="mx-[4px] min-h-0 px-2 pt-2 pb-2">
    <CardQuickAdd boardKey={boardKey} listId={listId} />
  </footer>
);

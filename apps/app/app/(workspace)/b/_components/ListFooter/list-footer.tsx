import { CardQuickAdd } from "../CardQuickAdd/card-quick-add";

type ListFooterProperties = {
  readonly boardKey: string;
  readonly listId: string;
  readonly quickAddOpen: boolean;
  readonly onQuickAddOpenChange: (open: boolean) => void;
};

export const ListFooter = ({
  boardKey,
  listId,
  onQuickAddOpenChange,
  quickAddOpen,
}: ListFooterProperties) => (
  <footer className="mx-[4px] min-h-0 shrink-0 px-2 pt-2 pb-2">
    <CardQuickAdd
      boardKey={boardKey}
      listId={listId}
      onOpenChange={onQuickAddOpenChange}
      open={quickAddOpen}
    />
  </footer>
);

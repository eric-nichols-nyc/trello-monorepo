import { CardQuickAddChrome } from "../CardQuickAdd/card-quick-add-trigger";
import { ListCardDragPreview } from "../ListCard/list-card-front";
import { ListHeader } from "../ListHeader/list-header";

type ListColumnDragPreviewProps = {
  title: string;
  /** Renders the same card stack as the column being dragged (read-only chrome). */
  cardIds?: string[];
  cardTitles?: Record<string, string>;
};

/**
 * Read-only list column for {@link DragOverlay}: header + card shells matching
 * the source column, without sortable or droppable.
 */
export function ListColumnDragPreview({
  title,
  cardIds = [],
  cardTitles = {},
}: ListColumnDragPreviewProps) {
  return (
    <div className="pointer-events-none w-[270px] shrink-0 cursor-grabbing">
      <div className="flex flex-col gap-2 rounded-lg bg-[rgb(16,18,4)] shadow-lg ring-2 ring-white/25">
        <ListHeader title={title} />
        <ol className="mx-[4px] my-0 flex min-h-0 list-none flex-col gap-2 p-0">
          {cardIds.map((cardId) => (
            <li className="relative flex list-none" key={cardId}>
              <ListCardDragPreview title={cardTitles[cardId] ?? "Card"} />
            </li>
          ))}
        </ol>
        <footer className="mx-[4px] min-h-0 px-2 pt-2 pb-2">
          <CardQuickAddChrome />
        </footer>
      </div>
    </div>
  );
}

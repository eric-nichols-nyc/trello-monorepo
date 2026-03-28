import { cn } from "@repo/design-system/lib/utils";
import type { CardPlacement } from "@/lib/board/card-list-pos";

import { ListCardTitle } from "./list-card-title";

/** Outer shell shared by {@link ListCard} and {@link ListCardChrome}. */
export const LIST_CARD_SURFACE_CLASSNAME =
  "relative flex min-h-[45px] w-full min-w-0 flex-1 items-center overflow-hidden rounded-[8px] bg-[rgb(36,37,40)] px-3 py-2";

function formatPlacementLabel(p: CardPlacement): string {
  const id = p.listId.length <= 8 ? p.listId : `${p.listId.slice(0, 8)}…`;
  const pos = Number.isInteger(p.pos) ? String(p.pos) : p.pos.toFixed(2);
  return `${id} · ${pos}`;
}

type ListCardTitleAreaProps = {
  title: string;
  className?: string;
  /** 1-based position within the list (shown on the right of the title). */
  listPosition?: number;
  /** List + suggested `pos` from {@link cardPlacementByLocalOrder} after local reorder. */
  cardPlacement?: CardPlacement;
};

/** Title row inside the card surface (typography + layout). */
export function ListCardTitleArea({
  title,
  className,
  listPosition,
  cardPlacement,
}: ListCardTitleAreaProps) {
  return (
    <div
      className={cn(
        "relative z-2 min-w-0 flex-1 transition-transform duration-200 ease-out",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <ListCardTitle className="min-w-0 flex-1" title={title} />
          {typeof listPosition === "number" ? (
            <span
              className="shrink-0 font-medium text-[11px] text-white/45 tabular-nums tracking-tight"
              title={`Position ${listPosition} in list`}
            >
              {listPosition}
            </span>
          ) : null}
        </div>
        {cardPlacement ? (
          <span
            className="truncate font-mono text-[10px] text-white/35 tabular-nums"
            title={`List ${cardPlacement.listId} · pos ${cardPlacement.pos}`}
          >
            {formatPlacementLabel(cardPlacement)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

type ListCardChromeProps = {
  title: string;
  listPosition?: number;
  cardPlacement?: CardPlacement;
};

/**
 * Static card surface for {@link DragOverlay} — composes the same shell and
 * title row as {@link ListCard} without sortable or checkbox.
 */
export function ListCardChrome({
  title,
  listPosition,
  cardPlacement,
}: ListCardChromeProps) {
  return (
    <div className={cn(LIST_CARD_SURFACE_CLASSNAME, "cursor-grabbing")}>
      <ListCardTitleArea
        cardPlacement={cardPlacement}
        className="translate-x-0"
        listPosition={listPosition}
        title={title}
      />
    </div>
  );
}

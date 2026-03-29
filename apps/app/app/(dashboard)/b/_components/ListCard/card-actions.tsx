"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import {
  Archive,
  ArrowRightLeft,
  Copy,
  SquareArrowOutUpRight,
  SquarePen,
  Trash2,
} from "lucide-react";

import {
  CardCoverChooser,
  isWithinCardCoverPanel,
} from "../CardCoverChooser";
import { EditDatesButton } from "./edit-dates-button";
import { isWithinEditDatesPanel } from "./edit-dates-panel";

export type CardActionsProps = {
  readonly cardId: string;
  readonly cardTitle: string;
  readonly onOpenCard?: () => void;
  readonly onChangeCover?: () => void;
  readonly onEditDates?: () => void;
  readonly onMove?: () => void;
  readonly onCopyCard?: () => void;
  readonly onArchive?: () => void;
  readonly onDeleteCard?: () => void;
};

/**
 * Card overflow menu: {@link SquarePen} trigger + actions. Lives fixed on the card
 * surface (sibling to the sliding title) so it does not move with hover animation.
 */
export function CardActions({
  cardTitle,
  onOpenCard,
  onChangeCover,
  onEditDates,
  onMove,
  onCopyCard,
  onArchive,
  onDeleteCard,
}: CardActionsProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Card actions: ${cardTitle}`}
          className={cn(
            "absolute top-1.5 right-2 z-10 rounded p-0.5 text-white/40 transition-colors",
            "hover:bg-white/10 hover:text-white/80",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/25",
            "data-[state=open]:bg-white/10 data-[state=open]:text-white/80"
          )}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          <SquarePen aria-hidden className="size-3.5" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-52"
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (
            isWithinEditDatesPanel(event.target) ||
            isWithinCardCoverPanel(event.target)
          ) {
            event.preventDefault();
          }
        }}
        onPointerDown={(event) => event.stopPropagation()}
        side="right"
        sideOffset={6}
      >
        <DropdownMenuItem
          onSelect={() => {
            onOpenCard?.();
          }}
        >
          <SquareArrowOutUpRight aria-hidden className="size-4" strokeWidth={2} />
          Open card
        </DropdownMenuItem>
        <DropdownMenuItem
          className="p-0"
          onSelect={(event) => event.preventDefault()}
        >
          <CardCoverChooser
            onPanelOpenChange={(open) => {
              if (open) {
                onChangeCover?.();
              }
            }}
            showLabel
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="p-0"
          onSelect={(event) => event.preventDefault()}
        >
          <EditDatesButton
            onPanelOpenChange={(open) => {
              if (open) {
                onEditDates?.();
              }
            }}
            showLabel
          />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onMove?.();
          }}
        >
          <ArrowRightLeft aria-hidden className="size-4" strokeWidth={2} />
          Move
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onCopyCard?.();
          }}
        >
          <Copy aria-hidden className="size-4" strokeWidth={2} />
          Copy card
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            onArchive?.();
          }}
          variant="destructive"
        >
          <Archive aria-hidden className="size-4" strokeWidth={2} />
          Archive
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            onDeleteCard?.();
          }}
          variant="destructive"
        >
          <Trash2 aria-hidden className="size-4" strokeWidth={2} />
          Delete card
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

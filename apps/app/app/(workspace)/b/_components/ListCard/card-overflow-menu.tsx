"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { ArrowRightLeft, SquareArrowOutUpRight, SquarePen } from "lucide-react";

import { CardCoverPickerTrigger } from "../card-cover/card-cover-picker-trigger";
import { isWithinCardCoverPicker } from "../card-cover/card-cover-picker";
import { CopyCardButton } from "./copy-card-button";
import { DeleteCardButton } from "./delete-card-button";
import { EditDatesButton } from "./edit-dates-button";
import { isWithinEditDatesPanel } from "./edit-dates-panel";

export type CardOverflowMenuProps = {
  readonly boardKey: string;
  readonly cardId: string;
  readonly cardTitle: string;
  /** Card has an image or solid cover — shows “Remove cover” in the picker. @default false */
  readonly hasCover?: boolean;
  readonly coverColor?: string | null;
  readonly coverImage?: string | null;
  readonly onOpenCard?: () => void;
  readonly onChangeCover?: () => void;
  readonly onEditDates?: () => void;
  readonly onMove?: () => void;
  readonly onArchive?: () => void;
};

/**
 * Pencil trigger opening a dropdown of card commands (open, cover, dates, move, copy, delete).
 * Pinned to the card chrome so it does not move with list-card hover motion.
 */
export function CardOverflowMenu({
  boardKey,
  cardId,
  cardTitle,
  hasCover = false,
  coverColor = null,
  coverImage = null,
  onOpenCard,
  onChangeCover,
  onEditDates,
  onMove,
}: CardOverflowMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`More options for card: ${cardTitle}`}
          className={cn(
            "absolute top-1.5 right-2 z-10 rounded p-0.5 text-white",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/40"
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
            isWithinCardCoverPicker(event.target)
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
          <SquareArrowOutUpRight
            aria-hidden
            className="size-4"
            strokeWidth={2}
          />
          Open card
        </DropdownMenuItem>
        <DropdownMenuItem
          className="p-0"
          onSelect={(event) => event.preventDefault()}
        >
          <CardCoverPickerTrigger
            boardKey={boardKey}
            cardId={cardId}
            coverColor={coverColor}
            coverImage={coverImage}
            hasCover={hasCover}
            onPickerOpenChange={(open) => {
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
        <CopyCardButton boardKey={boardKey} cardId={cardId} kind="menu" />
        <DropdownMenuSeparator />
        <DeleteCardButton boardKey={boardKey} cardId={cardId} kind="menu" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";
import { cn } from "@repo/design-system/lib/utils";
import { Trash2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useDeleteCard } from "@/queries/use-delete-card";

type DeleteCardButtonIconProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  kind?: "icon";
  /** @default "Delete card" */
  label?: string;
};

type DeleteCardButtonMenuProps = Omit<
  ComponentProps<typeof DropdownMenuItem>,
  "children" | "onSelect" | "variant"
> & {
  kind: "menu";
  boardKey: string;
  cardId: string;
  /** @default "Delete card" */
  label?: string;
};

export type DeleteCardButtonProps =
  | DeleteCardButtonIconProps
  | DeleteCardButtonMenuProps;

function DeleteCardMenuItem(props: DeleteCardButtonMenuProps) {
  const deleteCard = useDeleteCard();
  const {
    kind: _menuKind,
    boardKey,
    cardId,
    label: menuLabel = "Delete card",
    ...itemProps
  } = props;

  return (
    <DropdownMenuItem
      disabled={deleteCard.isPending}
      onSelect={() => {
        deleteCard.mutate(
          { boardKey, cardId },
          {
            onError: (error) => {
              // biome-ignore lint/suspicious/noAlert: temporary until toast UX
              globalThis.alert(
                error instanceof Error
                  ? error.message
                  : "Could not delete the card."
              );
            },
          }
        );
      }}
      variant="destructive"
      {...itemProps}
    >
      <Trash2 aria-hidden className="size-4" strokeWidth={2} />
      {menuLabel}
    </DropdownMenuItem>
  );
}

function DeleteCardIconButton(props: DeleteCardButtonIconProps) {
  const {
    kind: _iconKind,
    label: iconLabel = "Delete card",
    className,
    ...buttonProps
  } = props;

  return (
    <Button
      aria-label={iconLabel}
      className={cn(
        "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        className
      )}
      size="icon-sm"
      title={iconLabel}
      type="button"
      variant="ghost"
      {...buttonProps}
    >
      <Trash2 aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

export function DeleteCardButton(props: DeleteCardButtonProps) {
  if (props.kind === "menu") {
    return <DeleteCardMenuItem {...props} />;
  }
  return <DeleteCardIconButton {...props} />;
}

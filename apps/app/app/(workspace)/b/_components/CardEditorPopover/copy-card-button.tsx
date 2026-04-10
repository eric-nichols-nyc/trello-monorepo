"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";
import { Copy } from "lucide-react";
import type { ComponentProps } from "react";
import { useCopyCard } from "@/queries/use-copy-card";

type CopyCardButtonIconProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "variant"
> & {
  kind?: "icon";
  /** @default "Copy card" */
  label?: string;
};

type CopyCardButtonMenuProps = Omit<
  ComponentProps<typeof DropdownMenuItem>,
  "children" | "onSelect"
> & {
  kind: "menu";
  boardKey: string;
  cardId: string;
  /** @default "Copy card" */
  label?: string;
};

export type CopyCardButtonProps =
  | CopyCardButtonIconProps
  | CopyCardButtonMenuProps;

function CopyCardMenuItem(props: CopyCardButtonMenuProps) {
  const copyCard = useCopyCard();
  const {
    kind: _menuKind,
    boardKey,
    cardId,
    label: menuLabel = "Copy card",
    ...itemProps
  } = props;

  return (
    <DropdownMenuItem
      disabled={copyCard.isPending}
      onSelect={() => {
        copyCard.mutate(
          { boardKey, cardId },
          {
            onError: (error) => {
              // biome-ignore lint/suspicious/noAlert: temporary until toast UX
              globalThis.alert(
                error instanceof Error
                  ? error.message
                  : "Could not copy the card."
              );
            },
          }
        );
      }}
      {...itemProps}
    >
      <Copy aria-hidden className="size-4" strokeWidth={2} />
      {menuLabel}
    </DropdownMenuItem>
  );
}

function CopyCardIconButton(props: CopyCardButtonIconProps) {
  const {
    kind: _iconKind,
    label: iconLabel = "Copy card",
    className,
    ...buttonProps
  } = props;

  return (
    <Button
      aria-label={iconLabel}
      className={className}
      size="icon-sm"
      title={iconLabel}
      type="button"
      variant="ghost"
      {...buttonProps}
    >
      <Copy aria-hidden className="size-4" strokeWidth={2} />
    </Button>
  );
}

export function CopyCardButton(props: CopyCardButtonProps) {
  if (props.kind === "menu") {
    return <CopyCardMenuItem {...props} />;
  }
  return <CopyCardIconButton {...props} />;
}

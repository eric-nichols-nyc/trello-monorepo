"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { X } from "lucide-react";
import Image from "next/image";

const CREATE_BOARD_HEADER_IMAGE =
  "https://images.unsplash.com/photo-1646784208071-7f35325e10cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3MDY2fDB8MXxjb2xsZWN0aW9ufDF8MzE3MDk5fHx8fHwyfHwxNzc0ODIwNTEyfA&ixlib=rb-4.1.0&q=80&w=400";

export type CreateBoardHeaderProps =
  | {
      /** Omit toolbar; parent supplies {@link StackedPopoverHeader} (same back/pop as Templates). */
      readonly hideToolbar: true;
    }
  | {
      readonly hideToolbar?: false;
      /** Dismisses the popover / card. */
      readonly onClose: () => void;
    };

export function CreateBoardHeader(props: CreateBoardHeaderProps) {
  const stackChild =
    "hideToolbar" in props && props.hideToolbar === true;
  return (
    <CardHeader className="flex flex-col gap-0 space-y-0 border-b p-0">
      {stackChild ? null : (
        <div className="grid min-h-8 w-full grid-cols-[1fr_auto_1fr] items-center px-4 pt-3 pb-2">
          <span aria-hidden className="min-w-0" />
          <CardTitle
            className="justify-self-center whitespace-nowrap text-center font-semibold text-base"
            id="create-board-title"
          >
            Create Board
          </CardTitle>
          <div className="flex justify-end">
            <Button
              aria-label="Close"
              className="size-8 shrink-0"
              onClick={
                (props as Extract<CreateBoardHeaderProps, { onClose: () => void }>)
                  .onClose
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex w-full justify-center px-4 pb-2">
        <div className="relative h-[120px] w-[200px] shrink-0 overflow-hidden rounded-lg">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="200px"
            src={CREATE_BOARD_HEADER_IMAGE}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Image
              alt=""
              className="max-h-full max-w-full object-contain"
              height={120}
              src="/images/create-board-bg.svg"
              width={200}
            />
          </div>
        </div>
      </div>
      <p className="px-4 pb-3 text-left text-muted-foreground text-xs leading-snug">
        Header area for the create-board flow; wire title actions and context
        here later.
      </p>
    </CardHeader>
  );
}

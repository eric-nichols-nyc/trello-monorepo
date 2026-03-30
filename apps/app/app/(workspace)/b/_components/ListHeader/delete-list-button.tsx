"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import { useDeleteList } from "@/queries/use-delete-list";

type DeleteListButtonProps = {
  boardKey: string;
  listId: string;
};

export function DeleteListButton({ boardKey, listId }: DeleteListButtonProps) {
  const deleteList = useDeleteList();

  return (
    <DropdownMenuItem
      disabled={deleteList.isPending}
      onSelect={() => {
        deleteList.mutate(
          { boardKey, listId },
          {
            onError: (error) => {
              // biome-ignore lint/suspicious/noAlert: temporary until toast UX
              globalThis.alert(
                error instanceof Error
                  ? error.message
                  : "Could not delete the list."
              );
            },
          }
        );
      }}
      variant="destructive"
    >
      <Trash2 aria-hidden className="size-4" strokeWidth={2} />
      Delete list
    </DropdownMenuItem>
  );
}

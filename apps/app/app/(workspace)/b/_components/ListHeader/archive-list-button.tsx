"use client";

import { DropdownMenuItem } from "@repo/design-system/components/ui/dropdown-menu";
import { Archive } from "lucide-react";
import { useUpdateList } from "@/queries/use-update-list";

type ArchiveListButtonProps = {
  boardKey: string;
  listId: string;
};

export function ArchiveListButton({
  boardKey,
  listId,
}: ArchiveListButtonProps) {
  const updateList = useUpdateList();

  return (
    <DropdownMenuItem
      disabled={updateList.isPending}
      onSelect={() => {
        updateList.mutate(
          { boardKey, listId, updates: { closed: true } },
          {
            onError: (error) => {
              // biome-ignore lint/suspicious/noAlert: temporary until toast UX
              globalThis.alert(
                error instanceof Error
                  ? error.message
                  : "Could not archive the list."
              );
            },
          }
        );
      }}
      variant="destructive"
    >
      <Archive aria-hidden className="size-4" strokeWidth={2} />
      Archive list
    </DropdownMenuItem>
  );
}

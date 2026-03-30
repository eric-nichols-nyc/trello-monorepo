"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { createCardSchema } from "@repo/schemas";
import { X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useCreateCard } from "@/queries/use-create-card";

type CardQuickAddFormProperties = {
  /** Nest list id — `POST /api/lists/:listId/cards`. */
  readonly listId: string;
  /** Same key as `useBoardDetail` / `useCreateCard` cache + invalidation. */
  readonly boardKey: string;
  readonly onClose: () => void;
};

/**
 * Validates with `createCardSchema` (typically `{ name }`), then `useCreateCard`.
 * On success: `console.log`, close panel. On mutation error: `alert` (temporary).
 */
export const CardQuickAddForm = ({
  listId,
  boardKey,
  onClose,
}: CardQuickAddFormProperties) => {
  const [title, setTitle] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const createCard = useCreateCard();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError(null);

    const parsed = createCardSchema.safeParse({ name: title });
    if (!parsed.success) {
      const message = parsed.error.flatten().fieldErrors.name?.[0];
      setNameError(message ?? "Invalid card title");
      return;
    }

    createCard.mutate(
      { listId, boardKey, input: parsed.data },
      {
        onError: (error) => {
          // biome-ignore lint/suspicious/noAlert: temporary until toast UX
          globalThis.alert(
            error instanceof Error
              ? error.message
              : "Could not create the card."
          );
        },
        onSuccess: (data) => {
          console.log("Card created:", data);
          setTitle("");
          onClose();
        },
      }
    );
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          <Input
            aria-invalid={nameError !== null}
            aria-label="Card title"
            autoFocus
            className={cn(
              "flex-1 bg-[rgb(36,37,40)] text-white placeholder:text-white/40",
              nameError !== null && "border-red-400/80"
            )}
            disabled={createCard.isPending}
            onChange={(event) => {
              setTitle(event.target.value);
              if (nameError !== null) {
                setNameError(null);
              }
            }}
            placeholder="Enter a title for this card…"
            value={title}
          />
          <Button
            aria-label="Close"
            className="shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
            disabled={createCard.isPending}
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>
        {nameError !== null ? (
          <p className="text-red-300 text-xs" role="alert">
            {nameError}
          </p>
        ) : null}
      </div>
      <Button className="w-fit" disabled={createCard.isPending} type="submit">
        Add card
      </Button>
    </form>
  );
};

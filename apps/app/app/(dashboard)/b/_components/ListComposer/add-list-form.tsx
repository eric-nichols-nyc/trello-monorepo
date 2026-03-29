"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { cn } from "@repo/design-system/lib/utils";
import { createListSchema } from "@repo/schemas";
import { X } from "lucide-react";
import { type FormEvent, useCallback, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useCreateList } from "@/queries/use-create-list";

type AddListFormProps = {
  boardId: string;
  boardKey: string;
  onClose: () => void;
};

export const AddListForm = ({
  boardId,
  boardKey,
  onClose,
}: AddListFormProps) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const createList = useCreateList();

  const commitOrDismiss = useCallback(() => {
    if (createList.isPending) {
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    const parsed = createListSchema.safeParse({ name: trimmed });
    if (!parsed.success) {
      const message = parsed.error.flatten().fieldErrors.name?.[0];
      setNameError(message ?? "Invalid list name");
      return;
    }
    setNameError(null);
    createList.mutate(
      { boardId, boardKey, input: parsed.data },
      {
        onError: (error) => {
          // biome-ignore lint/suspicious/noAlert: temporary until toast UX
          globalThis.alert(
            error instanceof Error
              ? error.message
              : "Could not create the list."
          );
        },
        onSuccess: () => {
          setName("");
          onClose();
        },
      }
    );
  }, [boardId, boardKey, createList, name, onClose]);

  useClickOutside(containerRef, commitOrDismiss, true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commitOrDismiss();
  };

  return (
    <div ref={containerRef}>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Input
              aria-invalid={nameError !== null}
              aria-label="List name"
              autoFocus
              className={cn(
                "flex-1 bg-[rgb(36,37,40)] text-white placeholder:text-white/40",
                nameError !== null && "border-red-400/80"
              )}
              disabled={createList.isPending}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError !== null) {
                  setNameError(null);
                }
              }}
              placeholder="Enter list title…"
              value={name}
            />
            <Button
              aria-label="Cancel"
              className="shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
              disabled={createList.isPending}
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
        <Button className="w-fit" disabled={createList.isPending} type="submit">
          Add list
        </Button>
      </form>
    </div>
  );
};

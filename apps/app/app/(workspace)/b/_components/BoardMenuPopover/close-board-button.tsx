"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { X, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useCallback, useId, useState } from "react";

import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { useUpdateBoard } from "@/queries/use-update-board";

const closeBoardRowClass = cn(
  "h-auto w-full justify-start rounded-sm px-2 py-2 font-normal",
  "text-red-400 hover:bg-red-500/15 hover:text-red-300"
);

const confirmPanelClass = cn(
  "absolute inset-x-0 bottom-full z-20 mb-1 rounded-lg border border-white/10",
  "bg-[var(--board-menu-card-bg)] p-3 shadow-lg"
);

export type CloseBoardButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "size" | "type" | "variant"
> & {
  boardId: string;
  boardKey: string;
  /** Closes the board menu (e.g. before navigation). */
  onDismiss?: () => void;
  boardName?: string;
};

export function CloseBoardButton({
  boardId,
  boardKey,
  boardName: _boardName,
  className,
  onDismiss,
  ...props
}: CloseBoardButtonProps) {
  const router = useRouter();
  const { mutateAsync, isPending } = useUpdateBoard();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const titleId = useId();
  const descId = useId();

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setArchiveError(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    setArchiveError(null);
    try {
      await mutateAsync({
        boardId,
        boardKey,
        updates: { closed: true },
      });
      setConfirmOpen(false);
      onDismiss?.();
      router.push("/w");
    } catch (error) {
      const message =
        error instanceof BoardApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong";
      setArchiveError(message);
    }
  }, [boardId, boardKey, mutateAsync, onDismiss, router]);

  return (
    <div className="relative">
      {confirmOpen ? (
        <div
          aria-describedby={descId}
          aria-labelledby={titleId}
          className={confirmPanelClass}
          role="dialog"
        >
          <div className="relative flex items-center justify-center pr-9 pb-2">
            <p
              className="text-center font-semibold text-sm text-white"
              id={titleId}
            >
              Close board?
            </p>
            <Button
              aria-label="Dismiss"
              className="-translate-y-1/2 absolute top-1/2 right-0 size-8 shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
              disabled={isPending}
              onClick={closeConfirm}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X aria-hidden className="size-4" strokeWidth={2} />
            </Button>
          </div>
          <p className="text-center text-sm text-white/80" id={descId}>
            You can find and reopen closed boards at the bottom of{" "}
            <Link
              className="text-blue-400 underline decoration-blue-400/80 underline-offset-2 hover:text-blue-300"
              href="/w"
              onClick={closeConfirm}
            >
              your boards page
            </Link>
            .
          </p>
          {archiveError ? (
            <p className="mt-2 text-center text-red-300 text-xs" role="alert">
              {archiveError}
            </p>
          ) : null}
          <Button
            className="mt-4 h-10 w-full rounded-lg border-0 bg-[#f5b5b0] font-medium text-neutral-900 hover:bg-[#f0a8a2] disabled:opacity-60"
            disabled={isPending}
            onClick={() => {
              void handleConfirm();
            }}
            type="button"
          >
            {isPending ? "Closing…" : "Close"}
          </Button>
        </div>
      ) : null}
      <Button
        aria-expanded={confirmOpen}
        className={cn(closeBoardRowClass, className)}
        disabled={isPending}
        onClick={() => {
          setConfirmOpen((open) => !open);
        }}
        type="button"
        variant="ghost"
        {...props}
      >
        <XCircle aria-hidden className="size-4 shrink-0" strokeWidth={2} />
        Close board
      </Button>
    </div>
  );
}

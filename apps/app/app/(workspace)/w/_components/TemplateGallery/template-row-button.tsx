"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

import type { BoardTemplateCatalogItem } from "@/lib/api/board-templates/get-board-templates-client";

export type TemplateRowButtonProps = {
  readonly errorMessage?: string;
  readonly isRowPending: boolean;
  readonly onPick: () => void;
  readonly template: BoardTemplateCatalogItem;
  readonly workspaceMissing: boolean;
  /** Any template row is creating — disable other rows. */
  readonly workspacePending: boolean;
};

export function TemplateRowButton({
  errorMessage,
  isRowPending,
  onPick,
  template,
  workspaceMissing,
  workspacePending,
}: TemplateRowButtonProps) {
  const disabled = workspaceMissing || workspacePending;

  return (
    <div className="flex flex-col gap-0.5">
      <button
        aria-busy={isRowPending}
        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
        disabled={disabled}
        onClick={onPick}
        type="button"
      >
        <div className="relative size-9 shrink-0 overflow-hidden rounded bg-zinc-800">
          {template.backgroundImage !== undefined &&
          template.backgroundImage !== "" ? (
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="36px"
              src={template.backgroundImage}
            />
          ) : null}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">
          {template.title}
        </p>
        {isRowPending ? (
          <Loader2
            aria-hidden
            className="size-4 shrink-0 animate-spin text-zinc-400"
          />
        ) : null}
      </button>
      {errorMessage !== undefined && errorMessage !== "" ? (
        <p className="px-2 text-red-400 text-xs leading-snug" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

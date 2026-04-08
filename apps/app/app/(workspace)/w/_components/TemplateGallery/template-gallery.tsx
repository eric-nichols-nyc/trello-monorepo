"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type { BoardTemplateCatalogItem } from "@/lib/api/board-templates/get-board-templates-client";
import type { CreateBoardClientInput } from "@/lib/api/boards/create-board-client";
import { useBoardTemplates } from "@/queries/use-board-templates";
import { useCreateBoardMutation } from "@/queries/use-create-board-mutation";

import { TemplateRowButton } from "./template-row-button";

export type TemplateGalleryProps = {
  readonly onBoardCreated?: () => void;
  /** Default workspace for `POST /api/boards` (same as header create-board). */
  readonly workspaceId: string | null;
};

function pendingTemplateIdFromVariables(
  variables: CreateBoardClientInput | undefined
): string | undefined {
  if (variables === undefined) {
    return undefined;
  }
  return "templateId" in variables ? variables.templateId : undefined;
}

/**
 * Renders the authenticated template catalog from Nest (`GET /api/board-templates`),
 * backed by {@link useBoardTemplates}. Choosing a row calls `POST /api/boards` with `templateId`.
 */
export function TemplateGallery({
  onBoardCreated,
  workspaceId,
}: TemplateGalleryProps) {
  const [sectionOpen, setSectionOpen] = useState(true);
  const router = useRouter();
  const { mutateAsync, isPending, variables, isError, error, reset } =
    useCreateBoardMutation();

  const {
    data: templates,
    isPending: templatesLoading,
    isError: templatesError,
    error: templatesQueryError,
    authLoaded,
    isSignedIn,
  } = useBoardTemplates();

  const handleTemplatePick = useCallback(
    async (template: BoardTemplateCatalogItem) => {
      if (!workspaceId) {
        return;
      }
      reset();
      try {
        const { boardKey } = await mutateAsync({
          name: template.title,
          workspaceId,
          templateId: template.id,
        });
        onBoardCreated?.();
        router.push(`/b/${encodeURIComponent(boardKey)}`);
      } catch {
        /* mutation error state */
      }
    },
    [workspaceId, mutateAsync, onBoardCreated, reset, router]
  );

  const activeTemplateId = pendingTemplateIdFromVariables(variables);
  const failedTemplateId =
    isError ? pendingTemplateIdFromVariables(variables) : undefined;
  const rowErrorMessage =
    isError && error instanceof Error ? error.message : null;

  if (!authLoaded) {
    return <p className="px-3 py-2 text-sm text-zinc-500">Loading…</p>;
  }

  if (!isSignedIn) {
    return (
      <p className="px-3 py-2 text-sm text-zinc-500">Sign in to load templates.</p>
    );
  }

  if (templatesLoading) {
    return <p className="px-3 py-2 text-sm text-zinc-500">Loading…</p>;
  }

  if (templatesError) {
    return (
      <p className="px-3 py-2 text-sm text-red-400">
        {templatesQueryError instanceof Error
          ? templatesQueryError.message
          : "Could not load templates."}
      </p>
    );
  }

  if (templates === undefined || templates.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-zinc-500">No templates available.</p>
    );
  }

  return (
    <div className="flex max-h-[min(50dvh,360px)] flex-col px-1.5 pb-2 pt-1">
      {workspaceId === null ? (
        <p className="mb-1 px-2 text-destructive text-xs leading-snug" role="alert">
          No workspace found. Create a workspace before adding a board.
        </p>
      ) : null}
      <button
        aria-expanded={sectionOpen}
        className="mb-0.5 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80"
        onClick={() => {
          setSectionOpen((o) => !o);
        }}
        type="button"
      >
        <span className="text-sm font-medium text-zinc-400">Top templates</span>
        {sectionOpen ? (
          <ChevronUp aria-hidden className="size-4 shrink-0 text-zinc-500" />
        ) : (
          <ChevronDown aria-hidden className="size-4 shrink-0 text-zinc-500" />
        )}
      </button>
      {sectionOpen ? (
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {templates.map((t) => (
            <TemplateRowButton
              errorMessage={
                failedTemplateId === t.id
                  ? (rowErrorMessage ?? undefined)
                  : undefined
              }
              isRowPending={isPending && activeTemplateId === t.id}
              key={t.id}
              onPick={() => {
                void handleTemplatePick(t);
              }}
              template={t}
              workspaceMissing={workspaceId === null}
              workspacePending={isPending}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

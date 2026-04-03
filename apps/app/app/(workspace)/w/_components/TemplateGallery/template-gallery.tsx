"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import type { BoardTemplateCatalogItem } from "@/lib/api/board-templates/get-board-templates-client";
import { useBoardTemplates } from "@/queries/use-board-templates";

function TemplateRowButton({ template }: { template: BoardTemplateCatalogItem }) {
  return (
    <button
      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80"
      onClick={() => {
        console.log(template);
      }}
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
    </button>
  );
}

/**
 * Renders the authenticated template catalog from Nest (`GET /api/board-templates`),
 * backed by {@link useBoardTemplates}.
 */
export function TemplateGallery() {
  const [sectionOpen, setSectionOpen] = useState(true);
  const {
    data: templates,
    isPending,
    isError,
    error,
    authLoaded,
    isSignedIn,
  } = useBoardTemplates();

  if (!authLoaded) {
    return <p className="px-3 py-2 text-sm text-zinc-500">Loading…</p>;
  }

  if (!isSignedIn) {
    return (
      <p className="px-3 py-2 text-sm text-zinc-500">Sign in to load templates.</p>
    );
  }

  if (isPending) {
    return <p className="px-3 py-2 text-sm text-zinc-500">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="px-3 py-2 text-sm text-red-400">
        {error instanceof Error ? error.message : "Could not load templates."}
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
            <TemplateRowButton key={t.id} template={t} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

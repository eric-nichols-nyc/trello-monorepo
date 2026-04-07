"use client";

import { useAuth } from "@repo/clerk/client";
import { Button } from "@repo/design-system/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AlignLeft, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { updateCardClient } from "@/lib/api/cards/update-card-client";
import { toast } from "@/lib/toast";
import { boardDetailQueryKey } from "@/queries/board-detail-query";

const TinyMCEEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false },
);

function textFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function hasMeaningfulDescription(html: string): boolean {
  return html.trim() !== "" && textFromHtml(html) !== "";
}

export type CardBackDescriptionProps = {
  cardId: string;
  boardRouteKey: string;
  value: string;
  onChange: (value: string) => void;
};

export function CardBackDescription({
  cardId,
  boardRouteKey,
  value,
  onChange,
}: CardBackDescriptionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (html: string) => {
      const token = await getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      return updateCardClient(cardId, { description: html }, token);
    },
    onSuccess: (data) => {
      const record = data as Record<string, unknown>;
      const next =
        typeof record.description === "string" ? record.description : draft;
      onChange(next);
      setIsEditing(false);
      toast.success("Description saved");
      void queryClient.invalidateQueries({
        queryKey: boardDetailQueryKey(boardRouteKey),
      });
      router.refresh();
    },
    onError: () => {
      toast.error("Could not save description");
    },
  });

  const startEditing = useCallback(() => {
    setDraft(value);
    setIsEditing(true);
  }, [value]);

  const handleSave = useCallback(() => {
    saveMutation.mutate(draft);
  }, [draft, saveMutation]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setIsEditing(false);
  }, [value]);

  const showAddButton = !hasMeaningfulDescription(value) && !isEditing;
  const showView = hasMeaningfulDescription(value) && !isEditing;

  const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlignLeft className="size-5 text-zinc-400" />
          <h2 className="font-semibold text-zinc-100">Description</h2>
        </div>
        {showView && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto shrink-0 py-0.5 text-xs text-zinc-400 hover:text-zinc-100"
            onClick={startEditing}
          >
            <Pencil className="mr-1 inline size-3" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="w-full space-y-2">
          <TinyMCEEditor
            apiKey={tinymceApiKey}
            value={draft}
            onEditorChange={setDraft}
            init={{
              height: 200,
              menubar: false,
              branding: false,
              skin: "oxide-dark",
              content_css: "dark",
              plugins: ["lists", "link"],
              toolbar: "undo redo | bold italic | bullist numlist | link",
              content_style:
                "body { font-family: inherit; font-size: 14px; color: #e4e4e7; }",
              placeholder: "Add a description...",
              entity_encoding: "raw",
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              onClick={handleCancel}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : showAddButton ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex h-auto min-h-24 w-full items-start justify-start border-zinc-700 bg-zinc-800 py-3 text-left text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200"
          onClick={startEditing}
        >
          <Pencil className="mr-2 mt-0.5 size-4 shrink-0" />
          Add a Description
        </Button>
      ) : (
        <div
          className="card-back-description__html prose prose-sm prose-invert max-w-none rounded-md border border-zinc-700 bg-zinc-800/50 p-3 text-zinc-200 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-a:text-(--app-blue-accent)"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  );
}

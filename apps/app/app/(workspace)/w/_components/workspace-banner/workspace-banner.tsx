"use client";

import { cn } from "@repo/design-system/lib/utils";
import { Lock, SquarePen } from "lucide-react";
import { type CSSProperties, useState } from "react";
import {
  WorkspaceBannerForm,
  type WorkspaceBannerFormValues,
} from "./workspace-banner-form";

const defaultAvatarStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, #f9a8d4 0%, #a21caf 55%, #6b21a8 100%)",
};

type WorkspaceBannerProperties = {
  readonly workspaceName: string;
  readonly avatarLetter?: string;
  readonly visibilityLabel?: string;
  /** Show the edit control; wire behavior with `onEdit`. */
  readonly editable?: boolean;
  readonly onEdit?: () => void;
  readonly initialDescription?: string;
  readonly onWorkspaceSave?: (
    values: WorkspaceBannerFormValues
  ) => void | Promise<void>;
  readonly avatarStyle?: CSSProperties;
  readonly className?: string;
};

const resolveAvatarLetter = (name: string, explicit?: string): string => {
  if (explicit !== undefined && explicit.length > 0) {
    return explicit.slice(0, 1).toUpperCase();
  }
  const trimmed = name.trim();
  const first = trimmed[0];
  return first !== undefined ? first.toUpperCase() : "?";
};

export const WorkspaceBanner = ({
  workspaceName,
  avatarLetter: avatarLetterProperty,
  visibilityLabel = "Private",
  editable = false,
  onEdit,
  initialDescription,
  onWorkspaceSave,
  avatarStyle,
  className,
}: WorkspaceBannerProperties) => {
  const [isEditing, setIsEditing] = useState(false);
  const letter = resolveAvatarLetter(workspaceName, avatarLetterProperty);
  const mergedAvatarStyle: CSSProperties = {
    ...defaultAvatarStyle,
    ...avatarStyle,
  };

  const canEdit = editable || onEdit !== undefined;
  const showWorkspaceForm = isEditing && canEdit;

  return (
    <div
      className={cn("flex items-start gap-4", className)}
      data-testid="workspace-banner"
    >
      {showWorkspaceForm ? (
        <WorkspaceBannerForm
          initialDescription={initialDescription}
          initialName={workspaceName}
          onCancel={() => setIsEditing(false)}
          onSave={async (values) => {
            await onWorkspaceSave?.(values);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <div
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-xl font-bold text-2xl text-zinc-900 shadow-sm"
            style={mergedAvatarStyle}
          >
            {letter}
          </div>
          <div className="min-w-0 flex-1 space-y-1 pt-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-bold text-foreground text-xl tracking-tight">
                {workspaceName}
              </h1>
              {canEdit ? (
                <button
                  aria-label={`Edit workspace ${workspaceName}`}
                  className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    onEdit?.();
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  <SquarePen aria-hidden className="size-4" strokeWidth={2} />
                </button>
              ) : null}
            </div>
            <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Lock aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
              <span>{visibilityLabel}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

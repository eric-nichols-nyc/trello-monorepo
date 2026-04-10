"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { cn } from "@repo/design-system/lib/utils";
import { Loader2 } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

const formTypography = cn(
  "text-[11px] leading-snug",
  "[&_label]:text-[11px] [&_label]:leading-tight",
);

const greyFieldBorder = cn(
  "border-zinc-300 shadow-none dark:border-zinc-500",
  "focus-visible:border-zinc-400 focus-visible:ring-zinc-400/30 dark:focus-visible:border-zinc-400",
);

const inputCompact = cn(
  greyFieldBorder,
  "h-7 px-2 text-[11px] md:text-[11px]",
);

const textareaCompact = cn(
  greyFieldBorder,
  "min-h-14 px-2 py-1.5 text-[11px] md:text-[11px]",
);

const formActionsClass = "h-7 px-2.5 text-[11px]";

export type WorkspaceBannerFormValues = {
  readonly name: string;
  readonly description: string;
};

export type WorkspaceBannerFormProps = {
  readonly initialName: string;
  readonly initialDescription?: string;
  readonly onSave?: (values: WorkspaceBannerFormValues) => void | Promise<void>;
  readonly onCancel?: () => void;
  readonly className?: string;
};

export function WorkspaceBannerForm({
  initialName,
  initialDescription = "",
  onSave,
  onCancel,
  className,
}: WorkspaceBannerFormProps) {
  const formId = useId();
  const nameId = `${formId}-name`;
  const descriptionId = `${formId}-description`;

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [pending, setPending] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() === "") {
      return;
    }
    const values: WorkspaceBannerFormValues = {
      name: name.trim(),
      description: description.trim(),
    };
    setPending(true);
    const runSave = async () => {
      try {
        await onSave?.(values);
      } catch {
        // Parent may surface errors; keep form mounted.
      } finally {
        setPending(false);
      }
    };
    runSave();
  };

  return (
    <form
      className={cn(
        "box-border w-[252px] shrink-0 space-y-3 overflow-y-auto",
        formTypography,
        className
      )}
      data-testid="workspace-banner-form"
      onSubmit={handleSubmit}
    >
      <p className="text-[10px] text-muted-foreground leading-tight">
        Required fields are marked with an asterisk{" "}
        <span className="text-destructive">*</span>
      </p>

      <div className="space-y-2">
        <Label className="font-medium" htmlFor={nameId}>
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          autoComplete="organization"
          className={inputCompact}
          id={nameId}
          name="name"
          onChange={(e) => setName(e.target.value)}
          required
          value={name}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-medium" htmlFor={descriptionId}>
          Description (optional)
        </Label>
        <Textarea
          className={textareaCompact}
          id={descriptionId}
          name="description"
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          value={description}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          aria-busy={pending}
          className={cn(formActionsClass, "gap-1.5")}
          disabled={pending}
          type="submit"
        >
          {pending ? (
            <>
              <Loader2
                aria-hidden
                className="size-3.5 shrink-0 animate-spin"
              />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
        <Button
          className={formActionsClass}
          disabled={pending}
          onClick={() => onCancel?.()}
          type="button"
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

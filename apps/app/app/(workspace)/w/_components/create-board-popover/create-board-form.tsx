"use client";

import { useAuth } from "@repo/clerk/client";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { BoardApiError } from "@/lib/api/boards/board-api-error";
import { createBoardClient } from "@/lib/api/boards/create-board-client";
import {
  CreateBoardBackgroundPicker,
  type CreateBoardBackgroundSelection,
} from "./create-board-background-picker";
import { CreateBoardSubmitButton } from "./create-board-submit-button";

const BOARD_TITLE_INPUT_ID = "create-board-title-input";

export type CreateBoardFormProps = {
  readonly workspaceId: string | null;
  readonly onCreated?: () => void;
};

export function CreateBoardForm({
  workspaceId,
  onCreated,
}: CreateBoardFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(true);
  const [background, setBackground] =
    useState<CreateBoardBackgroundSelection>(null);
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const showTitleError = touched && title.trim() === "";
  const canSubmit =
    Boolean(workspaceId) &&
    title.trim() !== "" &&
    background !== null &&
    !pending;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    console.log("[CreateBoardForm] submit gates", {
      workspaceId: workspaceId ?? "(missing)",
      hasWorkspace: Boolean(workspaceId),
      titleTrimmedLength: title.trim().length,
      hasBackground: background !== null,
      background,
      pending,
      canSubmit,
    });
  }, [workspaceId, title, background, pending, canSubmit]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setTouched(true);
      setSubmitError(null);

      if (!workspaceId || title.trim() === "" || background === null) {
        return;
      }

      setPending(true);
      try {
        const body = {
          name: title.trim(),
          workspaceId,
          ...(background.kind === "color"
            ? { backgroundColor: background.colorHex }
            : { backgroundImage: background.imageRootUrl }),
        };

        const token = await getToken();
        if (!token) {
          throw new Error("Not authenticated");
        }
        const { boardKey } = await createBoardClient(body, token);
        onCreated?.();
        router.push(`/b/${encodeURIComponent(boardKey)}`);
      } catch (error) {
        let message = "Something went wrong";
        if (error instanceof BoardApiError) {
          message = error.message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        setSubmitError(message);
      } finally {
        setPending(false);
      }
    },
    [background, getToken, onCreated, router, title, workspaceId]
  );

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
      {workspaceId === null ? (
        <p className="text-destructive text-xs leading-snug" role="alert">
          No workspace found. Create a workspace before adding a board.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label
          className="font-medium text-muted-foreground text-xs"
          htmlFor={BOARD_TITLE_INPUT_ID}
        >
          Board title{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Input
          {...(showTitleError === true
            ? { "aria-describedby": "board-title-error" }
            : {})}
          aria-invalid={showTitleError}
          aria-required
          autoComplete="off"
          className="h-9 rounded-md bg-transparent text-sm"
          id={BOARD_TITLE_INPUT_ID}
          name="boardTitle"
          onBlur={() => {
            setTouched(true);
          }}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          required
          value={title}
        />
        {showTitleError ? (
          <p
            className="text-muted-foreground text-xs leading-snug"
            id="board-title-error"
            role="alert"
          >
            👋 Board title is required
          </p>
        ) : null}
      </div>

      <CreateBoardBackgroundPicker
        onChange={setBackground}
        value={background}
      />

      {background === null && touched ? (
        <p className="text-muted-foreground text-xs leading-snug" role="alert">
          Choose a background color or photo.
        </p>
      ) : null}

      {submitError ? (
        <p className="text-destructive text-xs leading-snug" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="mt-auto pt-2">
        <CreateBoardSubmitButton disabled={!canSubmit} pending={pending} />
      </div>
    </form>
  );
}

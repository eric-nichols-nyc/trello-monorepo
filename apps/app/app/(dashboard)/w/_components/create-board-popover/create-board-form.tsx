"use client";

import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import { type FormEvent, useCallback, useState } from "react";
import { CreateBoardBackgroundPicker } from "./create-board-background-picker";
import { CreateBoardSubmitButton } from "./create-board-submit-button";

const BOARD_TITLE_INPUT_ID = "create-board-title-input";

export function CreateBoardForm() {
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(true);

  const showTitleError = touched && title.trim() === "";

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setTouched(true);
      if (title.trim() === "") {
        return;
      }
    },
    [title]
  );

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
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

      <CreateBoardBackgroundPicker />

      <div className="mt-auto pt-2">
        <CreateBoardSubmitButton />
      </div>
    </form>
  );
}

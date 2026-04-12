"use client";

import { useState } from "react";

import { AddListButton } from "./add-list-button";
import { AddListForm } from "./add-list-form";

type AddListColumnProps = {
  boardId: string;
  boardKey: string;
};

/** Trailing board column: “Add list” control that expands into the create form. */
export const AddListColumn = ({ boardId, boardKey }: AddListColumnProps) => {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex w-[270px] shrink-0 flex-col gap-2">
      {formOpen ? (
        <AddListForm
          boardId={boardId}
          boardKey={boardKey}
          onClose={() => setFormOpen(false)}
        />
      ) : (
        <AddListButton onClick={() => setFormOpen(true)} />
      )}
    </div>
  );
};

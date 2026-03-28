"use client";

import { useState } from "react";

import { AddListButton } from "./add-list-button";
import { AddListForm } from "./add-list-form";

type ListComposerProps = {
  boardId: string;
  boardKey: string;
};

export const ListComposer = ({ boardId, boardKey }: ListComposerProps) => {
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

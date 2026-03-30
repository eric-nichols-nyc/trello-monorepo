import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CardQuickAddForm } from "./card-quick-add-form";

const createMutate = vi.hoisted(() => vi.fn());

vi.mock("@/queries/use-create-card", () => ({
  useCreateCard: () => ({
    isPending: false,
    mutate: createMutate,
  }),
}));

describe("CardQuickAddForm", () => {
  beforeEach(() => {
    createMutate.mockClear();
    createMutate.mockImplementation((_vars, options) => {
      options?.onSuccess?.({ id: "card-new" });
    });
  });

  it("shows a validation message when the title is empty", () => {
    const onClose = vi.fn();
    render(
      <CardQuickAddForm boardKey="my-board" listId="list-1" onClose={onClose} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(screen.getByRole("alert")).toBeVisible();
    expect(createMutate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("clears the name error when the user types", () => {
    render(
      <CardQuickAddForm boardKey="my-board" listId="list-1" onClose={vi.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add card" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Card title" }), {
      target: { value: "x" },
    });

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("calls mutate with list, board key, and parsed input then closes on success", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(vi.fn());
    const onClose = vi.fn();

    render(
      <CardQuickAddForm boardKey="my-board" listId="list-1" onClose={onClose} />
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Card title" }), {
      target: { value: "  Fix login  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate).toHaveBeenCalledWith(
      {
        listId: "list-1",
        boardKey: "my-board",
        input: { name: "Fix login" },
      },
      expect.any(Object)
    );
    expect(logSpy).toHaveBeenCalledWith("Card created:", { id: "card-new" });
    expect(screen.getByRole("textbox", { name: "Card title" })).toHaveValue("");
    expect(onClose).toHaveBeenCalledTimes(1);

    logSpy.mockRestore();
  });

  it("alerts on mutation error", () => {
    createMutate.mockImplementation((_vars, options) => {
      options?.onError?.(new Error("Network down"));
    });
    const alertSpy = vi.spyOn(globalThis, "alert").mockImplementation(vi.fn());

    render(
      <CardQuickAddForm boardKey="my-board" listId="list-1" onClose={vi.fn()} />
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Card title" }), {
      target: { value: "Task" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add card" }));

    expect(alertSpy).toHaveBeenCalledWith("Network down");
    alertSpy.mockRestore();
  });
});

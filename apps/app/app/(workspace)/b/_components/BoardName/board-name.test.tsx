import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BoardName } from "./board-name";

const boardMutate = vi.hoisted(() => vi.fn());

vi.mock("@/queries/use-update-board", () => ({
  useUpdateBoard: () => ({
    isPending: false,
    mutate: boardMutate,
  }),
}));

describe("BoardName", () => {
  beforeEach(() => {
    boardMutate.mockClear();
  });

  it("shows the board title as a button", () => {
    render(<BoardName boardId="b-1" boardKey="my-board" name="Sprint board" />);

    expect(screen.getByRole("button", { name: "Sprint board" })).toBeVisible();
    expect(screen.queryByRole("textbox", { name: "Board name" })).toBeNull();
  });

  it("toggles into edit mode when the title is clicked", () => {
    render(<BoardName boardId="b-1" boardKey="my-board" name="Sprint board" />);

    fireEvent.click(screen.getByRole("button", { name: "Sprint board" }));

    const field = screen.getByRole("textbox", { name: "Board name" });
    expect(field).toBeVisible();
    expect(field).toHaveValue("Sprint board");
    expect(screen.queryByRole("button", { name: "Sprint board" })).toBeNull();
  });

  it("toggles back on Escape without calling mutate", () => {
    render(<BoardName boardId="b-1" boardKey="my-board" name="Sprint board" />);

    fireEvent.click(screen.getByRole("button", { name: "Sprint board" }));

    const field = screen.getByRole("textbox", { name: "Board name" });
    fireEvent.change(field, { target: { value: "Edited title" } });
    fireEvent.keyDown(field, { key: "Escape", code: "Escape" });

    expect(screen.getByRole("button", { name: "Sprint board" })).toBeVisible();
    expect(boardMutate).not.toHaveBeenCalled();
  });

  it("closes edit mode on blur when the name is unchanged (no mutate)", () => {
    render(<BoardName boardId="b-1" boardKey="my-board" name="Sprint board" />);

    fireEvent.click(screen.getByRole("button", { name: "Sprint board" }));
    fireEvent.blur(screen.getByRole("textbox", { name: "Board name" }));

    expect(screen.getByRole("button", { name: "Sprint board" })).toBeVisible();
    expect(boardMutate).not.toHaveBeenCalled();
  });

  it("calls updateBoard.mutate with the new name when blur commits a change", () => {
    render(<BoardName boardId="b-1" boardKey="my-board" name="Sprint board" />);

    fireEvent.click(screen.getByRole("button", { name: "Sprint board" }));

    const field = screen.getByRole("textbox", { name: "Board name" });
    fireEvent.change(field, { target: { value: "Release train" } });
    fireEvent.blur(field);

    expect(boardMutate).toHaveBeenCalledTimes(1);
    expect(boardMutate.mock.calls[0]?.[0]).toEqual({
      boardId: "b-1",
      boardKey: "my-board",
      updates: { name: "Release train" },
    });
  });

  it("commits rename on Enter via blur (same mutate payload)", () => {
    render(<BoardName boardId="b-1" boardKey="my-board" name="Sprint board" />);

    fireEvent.click(screen.getByRole("button", { name: "Sprint board" }));

    const field = screen.getByRole("textbox", { name: "Board name" });
    fireEvent.change(field, { target: { value: "Q1 goals" } });
    fireEvent.keyUp(field, { key: "Enter", code: "Enter" });

    expect(boardMutate).toHaveBeenCalledTimes(1);
    expect(boardMutate.mock.calls[0]?.[0]).toEqual({
      boardId: "b-1",
      boardKey: "my-board",
      updates: { name: "Q1 goals" },
    });
  });
});

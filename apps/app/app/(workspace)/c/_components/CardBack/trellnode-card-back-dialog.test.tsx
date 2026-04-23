import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TrellnodeCardBackDialog } from "./trellnode-card-back-dialog";

const backMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: backMock,
  }),
}));

vi.mock("../CardBackPanel/card-back-panel", () => ({
  CardBackPanel: ({
    onCommentsPanelOpenChange,
  }: {
    onCommentsPanelOpenChange: (open: boolean) => void;
  }) => (
    <div>
      <button onClick={() => onCommentsPanelOpenChange(true)} type="button">
        Open comments
      </button>
      <button onClick={() => onCommentsPanelOpenChange(false)} type="button">
        Close comments
      </button>
    </div>
  ),
}));

describe("TrellnodeCardBackDialog", () => {
  it("only expands width when comments are open", () => {
    const { getByRole } = render(
      <TrellnodeCardBackDialog
        boardLists={[]}
        boardName="Board"
        boardRouteKey="board-key"
        card={{ id: "card-1" } as never}
        listName="Todo"
        mode="modal"
      />,
    );

    const dialogContent = document.body.querySelector('[data-slot="dialog-content"]');
    expect(dialogContent).not.toBeNull();
    expect(dialogContent?.className).toContain("max-w-[585px]!");

    fireEvent.click(getByRole("button", { name: "Open comments" }));
    expect(dialogContent?.className).toContain("max-w-[992px]!");

    fireEvent.click(getByRole("button", { name: "Close comments" }));
    expect(dialogContent?.className).toContain("max-w-[585px]!");
  });
});

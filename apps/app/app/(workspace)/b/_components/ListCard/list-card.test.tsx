import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ListCard } from "./list-card";

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    ref: vi.fn(),
    targetRef: vi.fn(),
    handleRef: vi.fn(),
    isDragging: false,
  }),
}));

vi.mock("@repo/clerk/client", () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue("test-token"),
  }),
}));

vi.mock("@/lib/api/cards/update-card-client", () => ({
  updateCardClient: vi.fn().mockResolvedValue({ completed: false }),
}));

vi.mock("@/lib/toast", () => ({
  toast: { error: vi.fn() },
}));

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

function listCardProps(onOpenCard?: () => void) {
  return {
    boardKey: "board-key",
    cardId: "card-1",
    columnId: "list-1",
    index: 0,
    title: "My task",
    completed: false,
    onCardCompletedChange: vi.fn(),
    onOpenCard,
    attachmentCount: 0,
    commentCount: 0,
    description: undefined as string | undefined,
    dueDate: undefined as Date | undefined,
    startDate: undefined as Date | undefined,
    checklistTotal: undefined as number | undefined,
    checklistCompleted: undefined as number | undefined,
    checklistDue: undefined as string | null | undefined,
  };
}

describe("ListCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onOpenCard when the card surface is clicked (title area)", () => {
    const onOpenCard = vi.fn();
    renderWithQuery(<ListCard {...listCardProps(onOpenCard)} />);

    fireEvent.click(screen.getByText("My task"));

    expect(onOpenCard).toHaveBeenCalledTimes(1);
  });

  it("does not call onOpenCard when the more-options control is clicked", () => {
    const onOpenCard = vi.fn();
    renderWithQuery(<ListCard {...listCardProps(onOpenCard)} />);

    fireEvent.click(
      screen.getByRole("button", { name: /More options for card: My task/i })
    );

    expect(onOpenCard).not.toHaveBeenCalled();
  });

  it("does not throw when onOpenCard is omitted and the surface is clicked", () => {
    renderWithQuery(<ListCard {...listCardProps(undefined)} />);

    expect(() => {
      fireEvent.click(screen.getByText("My task"));
    }).not.toThrow();
  });
});

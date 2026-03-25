import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalHeader } from "./global-header";

vi.mock("@repo/design-system/components/mode-toggle", () => ({
  ModeToggle: () => <div data-testid="mode-toggle" />,
}));

vi.mock("./user/user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

describe("GlobalHeader", () => {
  it("renders as an accessible banner with default title", () => {
    render(<GlobalHeader />);

    const header = screen.getByRole("banner");
    expect(header).toBeVisible();
    expect(header).toHaveAttribute("data-testid", "global-header");

    expect(screen.getByText("Dashboard")).toBeVisible();
  });

  it("renders a custom title", () => {
    render(<GlobalHeader title="Settings" />);

    expect(screen.getByText("Settings")).toBeVisible();
  });

  it("includes the user menu and theme toggle", () => {
    render(<GlobalHeader />);
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });

  it("renders search and create actions", () => {
    render(<GlobalHeader />);

    expect(screen.getByTestId("header-search-input")).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Create" })).toBeVisible();
  });
});

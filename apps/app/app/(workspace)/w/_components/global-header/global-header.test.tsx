import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalHeader } from "./global-header";

vi.mock("../user/user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

describe("GlobalHeader", () => {
  it("renders as an accessible banner with default title", () => {
    render(<GlobalHeader />);

    const header = screen.getByRole("banner");
    expect(header).toBeVisible();
    expect(header).toHaveAttribute("data-testid", "global-header");

    expect(screen.getByText("Trellnode")).toBeVisible();
  });

  it("reflects a custom title in the brand link accessible name", () => {
    render(<GlobalHeader title="Settings" />);

    expect(screen.getByText("Trellnode")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Settings — workspace home" })
    ).toBeVisible();
  });

  it("includes the user menu", () => {
    render(<GlobalHeader />);
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("renders header utility actions before the user menu", () => {
    render(<GlobalHeader />);
    expect(screen.getByTestId("header-utility-buttons")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Announcements" })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Help" })).toBeVisible();
  });

  it("renders search and create actions", () => {
    render(<GlobalHeader />);

    expect(screen.getByTestId("header-search-input")).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Search" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Create" })).toBeVisible();
  });
});

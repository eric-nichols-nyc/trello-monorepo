import { expect, test } from "@playwright/test";

test.describe("Home", () => {
  test("shows main heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "App", level: 1 })
    ).toBeVisible();
  });
});

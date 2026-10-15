import { expect, test } from "@playwright/test";

for (const [path, h1] of [
  ["/models", "Models"],
  ["/backtest", "Backtests"],
  ["/api-docs", "API docs"],
] as const) {
  test(`${path} renders and keeps the nav item active`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: h1 })).toHaveAttribute("aria-current", "page");
  });
}

test("an unbuilt section still shows its placeholder", async ({ page }) => {
  await page.goto("/gnss");
  await expect(page.getByRole("heading", { level: 1, name: "GNSS" })).toBeVisible();
});

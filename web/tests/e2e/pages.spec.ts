import { expect, test } from "@playwright/test";

for (const [path, h1] of [
  ["/models", "Models"],
  ["/backtest", "Backtests"],
  ["/api-docs", "API docs"],
  ["/aurora", "Aurora"],
  ["/gnss", "GNSS"],
] as const) {
  test(`${path} keeps its nav item active`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: h1 })).toHaveAttribute("aria-current", "page");
  });
}

test("the unbuilt CME section still shows its placeholder", async ({ page }) => {
  await page.goto("/cme");
  await expect(page.getByRole("heading", { level: 1, name: "CME tracker" })).toBeVisible();
});

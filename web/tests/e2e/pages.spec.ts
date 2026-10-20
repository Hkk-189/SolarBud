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

test("the Aurora page says the forecast is unavailable when the API cannot be reached", async ({ page }) => {
  await page.goto("/aurora");
  await expect(page.getByRole("heading", { level: 1, name: "Aurora" })).toBeVisible();
  await expect(page.getByText(/Forecast unavailable/)).toBeVisible();
});

test("the Aurora page draws the map and checks a place once a forecast arrives", async ({ page }) => {
  // The server has no API (it is unreachable on purpose), so the browser's own fetch is answered here.
  const horizons = [1, 3, 6].map((h) => ({ horizon_h: h, p10: 5, p50: 6, p90: 7.5 }));

  await page.route("**/api/kp-forecast", (route) =>
    route.fulfill({
      json: { issued_at: new Date().toISOString(), model_version: "e2e", data_stale: false, horizons },
    }),
  );
  await page.goto("/aurora");
  await expect(page.getByRole("img", { name: /Map of the world/ }).or(page.getByText(/Map unavailable/))).toBeVisible();
  await page.getByLabel("Place").selectOption("Tromsø");
  await expect(page.getByText(/Tromsø is at about \d+° N geomagnetic/)).toBeVisible();
});

test("the Models page has the forecast comparison panel", async ({ page }) => {
  await page.goto("/models");
  await expect(page.getByRole("heading", { level: 2, name: /forecast made 3 h ahead vs what happened/ })).toBeVisible();
});

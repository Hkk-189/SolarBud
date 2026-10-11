import { expect, test } from "@playwright/test";

test("home shows the shell, an empty state and the disclaimer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Space weather now" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link")).toHaveCount(7);
  await expect(page.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("status").filter({ hasText: "We can't reach a current forecast" })).toBeVisible();
  await expect(page.getByText("No data", { exact: true })).toBeVisible();
  await expect(page.getByText("Alert status unavailable")).toBeVisible();
  await expect(page.getByText("Solar wind history unavailable.")).toBeVisible();
  await expect(page.getByRole("link", { name: "NOAA SWPC" })).toHaveAttribute(
    "href",
    "https://www.swpc.noaa.gov",
  );
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`phone width has no horizontal scroll (${colorScheme})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );

    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("link", { name: "NOAA SWPC" })).toBeVisible();
    await ctx.close();
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`phone width with every explanation open has no horizontal scroll (${colorScheme})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme });
    const page = await ctx.newPage();
    await page.goto("http://localhost:3000/");

    const summaries = page.getByText("What does this mean?");
    const count = await summaries.count();

    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) await summaries.nth(i).click();

    await expect(page.locator("details[open]")).toHaveCount(count);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );

    expect(overflow).toBeLessThanOrEqual(0);
    await ctx.close();
  });
}

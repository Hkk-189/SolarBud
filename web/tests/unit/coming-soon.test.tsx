import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Page, { dynamicParams, generateMetadata, generateStaticParams } from "@/app/[section]/page";
import { NAV } from "@/components/shell/sidebar";
import { COMING_SOON } from "@/lib/explanations";

afterEach(cleanup);

it("renders the GNSS placeholder", async () => {
  render(await Page({ params: Promise.resolve({ section: "gnss" }) }));

  expect(screen.getByRole("heading", { level: 1, name: "GNSS" })).toBeTruthy();
  expect(screen.getByText(COMING_SOON.gnss.body)).toBeTruthy();
  expect(screen.getByText(/Planned for Phase 4\./)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Back to Overview" }).getAttribute("href")).toBe("/");
});

it("generates exactly the three unbuilt sections and refuses others", async () => {
  expect(generateStaticParams().map((p) => p.section).sort()).toEqual(
    ["aurora", "cme", "gnss"],
  );
  expect(dynamicParams).toBe(false);
  await expect(Page({ params: Promise.resolve({ section: "foo" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
});

it("covers every non-home sidebar link with a matching title", () => {
  const built = ["/backtest", "/models", "/api-docs"];

  for (const { href, label } of NAV.filter((n) => n.href !== "/" && !built.includes(n.href))) {
    const entry = Object.entries(COMING_SOON).find(([key]) => `/${key}` === href);

    expect(entry, href).toBeDefined();
    expect(entry?.[1].title).toBe(label);
  }
});

it("gives each section its own tab title", async () => {
  expect(await generateMetadata({ params: Promise.resolve({ section: "gnss" }) })).toEqual({ title: "GNSS" });
  expect(await generateMetadata({ params: Promise.resolve({ section: "cme" }) })).toEqual({ title: "CME tracker" });
});

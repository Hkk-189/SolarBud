import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

function block(selectorPattern: RegExp): Record<string, string> {
  const m = css.match(selectorPattern);
  if (!m) throw new Error(`no CSS block matches ${selectorPattern}`);
  return Object.fromEntries([...m[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()]));
}

const light = block(/:root\s*\{([^}]*)\}/);
const dark = block(/:root\[data-theme="dark"\]\s*\{([^}]*)\}/);
const darkMedia = block(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/);

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const text = (vars: Record<string, string>, fg: string, bg: string) => ratio(vars[fg], vars[bg]);

describe("design tokens meet WCAG AA (4.5:1) for text", () => {
  it.each([
    ["--foreground", "--background"],
    ["--foreground", "--surface-elevated"],
    ["--muted", "--background"],
    ["--muted", "--surface"],
    ["--muted", "--surface-soft"],
    ["--on-primary", "--primary-fill"],
    ["--on-primary", "--primary-fill-hover"],
    ["--primary-fill-hover", "--background"],
    ["--g0-fg", "--g0-bg"],
    ["--g1-fg", "--g1-bg"],
    ["--g2-fg", "--g2-bg"],
    ["--g3-fg", "--g3-bg"],
    ["--g4-fg", "--g4-bg"],
    ["--g5-fg", "--g5-bg"],
  ])("light: %s on %s", (fg, bg) => {
    expect(text(light, fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["--foreground", "--background"],
    ["--foreground", "--surface"],
    ["--muted", "--background"],
    ["--muted", "--surface"],
  ])("dark: %s on %s", (fg, bg) => {
    const merged = { ...light, ...dark };
    expect(text(merged, fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("brand orange is not used behind white text (it fails AA)", () => {
    expect(ratio(light["--on-primary"], light["--primary"])).toBeLessThan(4.5);
    expect(light["--primary-fill"]).not.toBe(light["--primary"]);
  });

  it("the OS-dark rule and the manual data-theme=dark rule stay identical", () => {
    expect(darkMedia).toEqual(dark);
  });
});

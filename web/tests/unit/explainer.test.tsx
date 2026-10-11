import { cleanup, render, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { Explainer } from "@/components/cards/explainer";

afterEach(cleanup);

const explain = { summary: "Plain summary.", details: ["First detail.", "Second detail."] };

it("shows the summary and a closed disclosure holding every detail", () => {
  const { container } = render(<Explainer explain={explain} />);
  const view = within(container);
  expect(view.getByText("Plain summary.")).toBeTruthy();
  expect(view.getByText("What does this mean?").tagName).toBe("SUMMARY");
  const details = container.querySelector("details");

  if (!details) throw new Error("no details element");
  expect(details.open).toBe(false);

  for (const d of explain.details) expect(within(details).getByText(d)).toBeTruthy();
});

it("shows an open/closed chevron that screen readers skip", () => {
  const { container } = render(<Explainer explain={explain} />);
  const summary = container.querySelector("summary");
  const chevron = summary?.querySelector("[aria-hidden='true']");

  expect(chevron).not.toBeNull();
  expect(summary?.textContent).toContain("What does this mean?");
  expect(within(container).getByText("What does this mean?").tagName).toBe("SUMMARY");
});

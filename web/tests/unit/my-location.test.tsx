import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MyLocation } from "@/components/forecast/my-location";

afterEach(cleanup);

const pick = (name: string) => fireEvent.change(screen.getByLabelText("Place"), { target: { value: name } });

it("says Tromsø is in reach at Kp 5 and tells the map", () => {
  const onChange = vi.fn();

  render(<MyLocation likelyKp={5} highKp={6} onChange={onChange} />);
  pick("Tromsø");
  expect(screen.getByText(/Tromsø is at about/)).toBeTruthy();
  expect(screen.getByText(/Likely: in reach/)).toBeTruthy();
  expect(screen.getByText(/Could reach: in reach/)).toBeTruthy();
  expect(onChange).toHaveBeenLastCalledWith({ name: "Tromsø", lat: 69.65, lon: 18.96 });
});

it("says Delhi is not in reach even at Kp 9", () => {
  render(<MyLocation likelyKp={9} highKp={9} onChange={vi.fn()} />);
  pick("Delhi");
  expect(screen.getByText(/Likely: not in reach/)).toBeTruthy();
  expect(screen.getByText(/Could reach: not in reach/)).toBeTruthy();
});

it("below Kp 5 says it cannot say for a place poleward of 56 degrees, and not in reach for one equatorward of it", () => {
  const { unmount } = render(<MyLocation likelyKp={3} highKp={4.5} onChange={vi.fn()} />);

  pick("Tromsø");
  expect(screen.getByText(/Likely: can't say below Kp 5/)).toBeTruthy();
  unmount();
  render(<MyLocation likelyKp={3} highKp={4.5} onChange={vi.fn()} />);
  pick("Delhi");
  expect(screen.getByText(/Likely: not in reach/)).toBeTruthy();
});

it("announces the result politely and links the error to its field", () => {
  const { container } = render(<MyLocation likelyKp={7} highKp={8} onChange={vi.fn()} />);

  expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
  pick("custom");
  fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: "95" } });
  fireEvent.change(screen.getByLabelText(/Longitude/), { target: { value: "10" } });

  const lat = screen.getByLabelText(/Latitude/);

  expect(lat.getAttribute("aria-invalid")).toBe("true");
  expect(document.getElementById(lat.getAttribute("aria-describedby") ?? "")?.textContent).toMatch(/Latitude must be/);
});

it("shows an inline error and no result for a latitude out of range", () => {
  const onChange = vi.fn();

  render(<MyLocation likelyKp={7} highKp={8} onChange={onChange} />);
  pick("custom");
  fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: "95" } });
  fireEvent.change(screen.getByLabelText(/Longitude/), { target: { value: "10" } });
  expect(screen.getByRole("alert").textContent).toMatch(/Latitude must be a number from -90 to 90/);
  expect(screen.queryByText(/is at about/)).toBeNull();
  expect(onChange).toHaveBeenLastCalledWith(null);
});

it("shows nothing before a place is chosen", () => {
  render(<MyLocation likelyKp={7} highKp={8} onChange={vi.fn()} />);
  expect(screen.queryByText(/is at about/)).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
});

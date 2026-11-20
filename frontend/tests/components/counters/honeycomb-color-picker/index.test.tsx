import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { HoneycombColorPicker } from "@/components/counters/honeycomb-color-picker";

it("adds the clicked color from the honeycomb grid", () => {
  // Action buttons must emit even for the controlled current value because
  // adding is the click's side effect rather than a form-only selection.
  const onSelect = vi.fn();

  render(<HoneycombColorPicker value="#22c55e" onSelect={onSelect} />);

  fireEvent.click(screen.getByRole("button", { name: "Green" }));

  expect(onSelect).toHaveBeenCalledWith("#22c55e");
  expect(
    screen.getByRole("button", { name: "Green" }).getAttribute("aria-pressed"),
  ).toBe("true");
});

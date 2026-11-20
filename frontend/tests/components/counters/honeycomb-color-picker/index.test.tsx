import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { HoneycombColorPicker } from "@/components/counters/honeycomb-color-picker";

it("selects a color from the honeycomb grid", () => {
  // Clicking a native radio is the user's interaction boundary; checking the
  // controlled value separately ensures the component does not mutate state.
  const onChange = vi.fn();

  render(<HoneycombColorPicker value="#22c55e" onChange={onChange} />);

  fireEvent.click(screen.getByRole("radio", { name: "Red" }));

  expect(onChange).toHaveBeenCalledWith("#ef4444");
  expect(
    screen.getByRole<HTMLInputElement>("radio", { name: "Green" }).checked,
  ).toBe(true);
});

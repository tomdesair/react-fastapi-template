import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CounterCard } from "@/components/counters/counter-card";

// React Testing Library does not otherwise guarantee DOM isolation between
// standalone Vitest tests when automatic cleanup is not configured.
afterEach(cleanup);

it("shows a counter and handles increments", () => {
  // Exercise both callbacks from the same rendered card to verify that action
  // wiring does not depend on parent application state.
  const onIncrement = vi.fn();
  const onDelete = vi.fn();

  render(
    <CounterCard
      counter={{ id: 1, color: "#ef4444", value: 3 }}
      disabled={false}
      onIncrement={onIncrement}
      onDelete={onDelete}
    />,
  );

  expect(screen.getByLabelText("Value 3")).toBeTruthy();
  expect(screen.getByText("#ef4444")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Increment Counter" }));
  expect(onIncrement).toHaveBeenCalledOnce();
  fireEvent.click(
    screen.getByRole("button", { name: "Delete #ef4444 counter" }),
  );
  expect(onDelete).toHaveBeenCalledOnce();
});

it("disables counter updates while a mutation is pending", () => {
  // The shared pending flag is a race guard: mutation controls must remain
  // keyboard- and pointer-disabled until query invalidation settles.
  render(
    <CounterCard
      counter={{ id: 1, color: "#0000ff", value: 0 }}
      disabled
      onIncrement={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  expect(
    screen.getByRole<HTMLButtonElement>("button", {
      name: "Increment Counter",
    }).disabled,
  ).toBe(true);
});

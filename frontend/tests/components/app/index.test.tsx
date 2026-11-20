import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/components/app";
import type { Counter } from "@/services/counters";

describe("App", () => {
  let queryClient: QueryClient;
  let counters: Counter[];

  beforeEach(() => {
    // Each test owns its persisted-record model and query client so mutation
    // cache state cannot leak between otherwise independent user flows.
    counters = [{ id: 1, color: "#0000ff", value: 0 }];
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();
        // Model DELETE first because its 204 body intentionally differs from
        // the JSON representations returned by every other counter endpoint.
        if (init?.method === "DELETE") {
          const parts = url.split("/");
          const id = Number(parts[parts.length - 1]);
          counters = counters.filter((counter) => counter.id !== id);
          return new Response(null, { status: 204 });
        }

        // Duplicate colors exercise the real 409 error path surfaced by the
        // service rather than allowing the UI mock to become too permissive.
        if (url === "/api/counters" && init?.method === "POST") {
          const { color } = JSON.parse(init.body as string) as {
            color: string;
          };
          // This guard deliberately reproduces the backend's uniqueness
          // behavior so the integration test covers the visible recovery path.
          if (counters.some((counter) => counter.color === color)) {
            return Response.json(
              { detail: "Color is already used. Pick another color." },
              { status: 409 },
            );
          }
          const created = {
            id: counters.length + 1,
            color,
            value: 0,
          };
          counters.push(created);
          return Response.json(created, { status: 201 });
        }

        // The increment branch mutates the in-memory server model so query
        // invalidation proves the UI reads refreshed data from the API layer.
        if (url.endsWith("/increment")) {
          const parts = url.split("/");
          const id = Number(parts[parts.length - 2]);
          const counter = counters.find((item) => item.id === id);
          // Only an existing persisted record can be incremented; a missing
          // record follows neither the success nor creation path in the mock.
          if (counter) {
            counter.value += 1;
            return Response.json(counter);
          }
        }

        return Response.json(counters);
      }),
    );
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  it("loads and increments every persisted counter", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(await screen.findByLabelText("Value 0")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Increment Counter" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Value 1")).toBeTruthy();
    });
  });

  it("adds a counter and reports duplicate colors", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("#0000ff")).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Red" }));
    fireEvent.click(screen.getByRole("button", { name: "Add new counter" }));
    expect(await screen.findByText("#ef4444")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Add new counter" }));
    expect(
      await screen.findByText("Color is already used. Pick another color."),
    ).toBeTruthy();
  });

  it("deletes a counter card", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(await screen.findByLabelText("Value 0")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Delete #0000ff counter" }),
    );

    await waitFor(() => {
      expect(screen.queryByLabelText("Value 0")).toBeNull();
    });
  });
});

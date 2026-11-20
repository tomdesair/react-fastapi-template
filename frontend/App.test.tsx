import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    let counter = 0;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          const { amount } = JSON.parse(init.body as string) as {
            amount: number;
          };
          counter += amount;
          return new Response(null, { status: 200 });
        }

        return Response.json({ counter });
      }),
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.unstubAllGlobals();
  });

  it("loads and increments the counter", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("0")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Increment Counter" }));

    await waitFor(() => {
      expect(screen.getByText("1")).toBeTruthy();
    });
  });
});

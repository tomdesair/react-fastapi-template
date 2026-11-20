import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createCounter,
  deleteCounter,
  getCounters,
  incrementCounter,
} from "@/services/counters";

afterEach(() => {
  // Every service call owns its mocked network contract; restoring fetch avoids
  // a response from one operation affecting later assertions.
  vi.unstubAllGlobals();
});

describe("counter service", () => {
  it("gets counters", async () => {
    // GET is deliberately asserted without an init object to preserve the
    // simplest and most cache-friendly request contract.
    const counters = [{ id: 1, color: "#0000ff", value: 3 }];
    const fetchMock = vi.fn().mockResolvedValue(Response.json(counters));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCounters()).resolves.toEqual(counters);
    expect(fetchMock).toHaveBeenCalledWith("/api/counters");
  });

  it("creates a counter", async () => {
    const counter = { id: 2, color: "#ef4444", value: 0 };
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json(counter, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createCounter("#ef4444")).resolves.toEqual(counter);
    expect(fetchMock).toHaveBeenCalledWith("/api/counters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: "#ef4444" }),
    });
  });

  it("increments a counter", async () => {
    const counter = { id: 1, color: "#0000ff", value: 4 };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(counter));
    vi.stubGlobal("fetch", fetchMock);

    await expect(incrementCounter(1)).resolves.toEqual(counter);
    expect(fetchMock).toHaveBeenCalledWith("/api/counters/1/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1 }),
    });
  });

  it("deletes a counter", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteCounter(1)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/counters/1", {
      method: "DELETE",
    });
  });

  it("surfaces API validation details", async () => {
    // Domain errors must expose FastAPI's safe string detail so the UI can tell
    // the user how to correct a duplicate color.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          { detail: "Color is already used. Pick another color." },
          { status: 409 },
        ),
      ),
    );

    await expect(createCounter("#0000ff")).rejects.toThrow(
      "Color is already used. Pick another color.",
    );
  });

  it("uses a fallback error for non-JSON responses", async () => {
    // Infrastructure layers may replace a FastAPI response with plain text;
    // callers still need a stable operation-specific message in that case.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Service unavailable", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        }),
      ),
    );

    await expect(getCounters()).rejects.toThrow(
      "Failed to fetch counters.",
    );
  });
});

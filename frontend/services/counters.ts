export interface Counter {
  id: number;
  color: string;
  value: number;
}

export const countersQueryKey = ["counters"] as const;

async function readError(response: Response, fallback: string): Promise<Error> {
  try {
    const body: unknown = await response.json();
    // FastAPI uses a string `detail` for our domain errors. Narrowing the
    // untrusted JSON shape prevents arbitrary error bodies from entering the UI
    // as if they were known API messages.
    if (
      typeof body === "object" &&
      body !== null &&
      "detail" in body &&
      typeof body.detail === "string"
    ) {
      return new Error(body.detail);
    }
  } catch (error) {
    // An empty or non-JSON body is expected for proxies and infrastructure
    // failures, so use the operation-specific fallback. Network/parser
    // exceptions unrelated to body syntax must still be visible to callers.
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }
  return new Error(fallback);
}

export async function getCounters(): Promise<Counter[]> {
  const response = await fetch("/api/counters");
  // fetch only rejects transport failures; explicit status handling makes
  // FastAPI validation and readiness errors reject through TanStack Query.
  if (!response.ok) {
    throw await readError(response, "Failed to fetch counters.");
  }
  return (await response.json()) as Counter[];
}

export async function createCounter(color: string): Promise<Counter> {
  const response = await fetch("/api/counters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ color }),
  });
  // A 4xx here commonly carries the duplicate-color guidance that the form
  // must display, while 5xx responses use the safer operation fallback.
  if (!response.ok) {
    throw await readError(response, "Counter could not be created.");
  }
  return (await response.json()) as Counter;
}

export async function incrementCounter(id: number): Promise<Counter> {
  const response = await fetch(`/api/counters/${id}/increment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 1 }),
  });
  // A missing or concurrently deleted card returns 404; rejecting it lets the
  // query UI report the stale operation without inventing a local value.
  if (!response.ok) {
    throw await readError(response, "Counter could not be updated.");
  }
  return (await response.json()) as Counter;
}

export async function deleteCounter(id: number): Promise<void> {
  const response = await fetch(`/api/counters/${id}`, { method: "DELETE" });
  // A failed delete can leave the card present, so surface the failure rather
  // than optimistically removing persisted data from the cache.
  if (!response.ok) {
    throw await readError(response, "Counter could not be deleted.");
  }
  // The API intentionally returns 204 for deletion, so parsing no body keeps
  // the service aligned with the HTTP contract and avoids a JSON exception.
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import "./app.css";
import fastapiLogo from "@/assets/fastapi.svg";
import reactLogo from "@/assets/react.svg";
import { CounterCard } from "@/components/counters/counter-card";
import { HoneycombColorPicker } from "@/components/counters/honeycomb-color-picker";
import {
  countersQueryKey,
  createCounter,
  deleteCounter,
  getCounters,
  incrementCounter,
} from "@/services/counters";

function App() {
  const queryClient = useQueryClient();
  const [newColor, setNewColor] = useState("#22c55e");
  const countersQuery = useQuery({
    queryKey: countersQueryKey,
    queryFn: getCounters,
  });
  const createMutation = useMutation({
    mutationFn: createCounter,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: countersQueryKey }),
  });
  const incrementMutation = useMutation({
    mutationFn: incrementCounter,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: countersQueryKey }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCounter,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: countersQueryKey }),
  });

  function addCounter(color: string) {
    // A color click is the creation action; retaining it as the controlled
    // value gives the picker visible feedback after a successful or failed add.
    setNewColor(color);
    createMutation.mutate(color);
  }

  return (
    // All server state remains in TanStack Query. Invalidating after each
    // mutation refetches the backend as the authority instead of maintaining a
    // second client-side list that can drift from persisted records.
    <div className="min-h-screen bg-background p-8">
      <main className="container mx-auto max-w-5xl">
        <div className="mb-12 flex items-center justify-center gap-8">
          <a
            href="https://fastapi.tiangolo.com"
            target="_blank"
            className="transition-transform hover:scale-110"
          >
            <img
              src={fastapiLogo}
              className="h-16 w-16 animate-spin-slow"
              alt="FastAPI logo"
            />
          </a>
          <span className="text-4xl font-bold text-muted-foreground">+</span>
          <a
            href="https://react.dev"
            target="_blank"
            className="transition-transform hover:scale-110"
          >
            <img
              src={reactLogo}
              className="h-16 w-16 animate-spin-slow"
              alt="React logo"
            />
          </a>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="bg-gradient-to-r from-primary/70 to-primary bg-clip-text text-4xl font-bold text-transparent">
            React + FastAPI Counters
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Create color-coded counters and keep every value in a persistent
            SQLite database.
          </p>
        </div>

        <section className="mx-auto mt-10 max-w-xl rounded-lg bg-card p-6 shadow-lg">
          <div className="min-w-0 w-full">
            <HoneycombColorPicker
              value={newColor}
              disabled={createMutation.isPending}
              onSelect={addCounter}
            />
          </div>
          {createMutation.isError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {createMutation.error.message}
            </p>
          )}
        </section>

        <section className="mt-8" aria-label="Counters">
          {countersQuery.isPending ? (
            <p className="text-center text-muted-foreground">
              Loading counters...
            </p>
          ) : countersQuery.isError ? (
            <p role="alert" className="text-center text-destructive">
              Counters are unavailable.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {countersQuery.data.map((counter) => (
                <CounterCard
                  key={counter.id}
                  counter={counter}
                  disabled={
                    // A single pending mutation blocks duplicate actions across
                    // cards, preventing stale request ordering from overwriting
                    // the list after a delete or increment.
                    incrementMutation.isPending || deleteMutation.isPending
                  }
                  onIncrement={() => incrementMutation.mutate(counter.id)}
                  onDelete={() => deleteMutation.mutate(counter.id)}
                />
              ))}
            </div>
          )}
          {incrementMutation.isError && (
            <p role="alert" className="mt-4 text-center text-destructive">
              {incrementMutation.error.message}
            </p>
          )}
          {deleteMutation.isError && (
            <p role="alert" className="mt-4 text-center text-destructive">
              {deleteMutation.error.message}
            </p>
          )}
        </section>
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        Backend data is stored in <code>database.db</code>.
      </footer>
    </div>
  );
}

export default App;

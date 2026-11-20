import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/components/app";

// One QueryClient per browser entry point preserves the cache for the lifetime
// of the page and keeps all counter API state under TanStack Query ownership.
const queryClient = new QueryClient();

// StrictMode intentionally double-runs development-only lifecycles so side
// effects that depend on assumptions about render count fail early.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

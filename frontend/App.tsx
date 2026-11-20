import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import fastapiLogo from "./assets/fastapi.svg";
import { Button } from "@/components/ui/button";

function App() {
  const [counter, setCounter] = useState<number | null>(null);

  const getCounter = async () => {
    const response = await fetch("/api/counter");
    return (await response.json()) as { counter: number };
  };

  const fetchCounter = async () => {
    try {
      const data = await getCounter();
      setCounter(data.counter);
    } catch (error) {
      console.error("Failed to fetch counter:", error);
    }
  };

  // Increment the counter
  const incrementCounter = async () => {
    try {
      await fetch("/api/counter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 1 }),
      });
      // Fetch the updated counter value
      await fetchCounter();
    } catch (error) {
      console.error("Failed to increment counter:", error);
    }
  };

  // Fetch counter on component mount
  useEffect(() => {
    let active = true;

    getCounter()
      .then((data) => {
        if (active) {
          setCounter(data.counter);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch counter:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Logo section */}
        <div className="flex justify-center items-center gap-8 mb-12">
          <a
            href="https://fastapi.tiangolo.com"
            target="_blank"
            className="hover:scale-110 transition-transform"
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
            className="hover:scale-110 transition-transform"
          >
            <img
              src={reactLogo}
              className="h-16 w-16 animate-spin-slow"
              alt="React logo"
            />
          </a>
        </div>

        {/* Main content */}
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
            React + FastAPI Template
          </h1>

          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A full-stack template featuring React for the frontend and FastAPI
            for the backend
          </p>

          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => window.open("https://react.dev/learn", "_blank")}
            >
              Learn React
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                window.open("https://fastapi.tiangolo.com/tutorial/", "_blank")
              }
            >
              Learn FastAPI
            </Button>
          </div>

          {/* Grid layout for Counter and Quick Start */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* Quick Start section */}
            <div className="bg-card rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6">
                Development Quickstart
              </h2>
              <div className="text-left text-muted-foreground space-y-4">
                <p>1. Start the FastAPI backend:</p>
                <code className="block bg-muted p-3 rounded text-sm">
                  just develop backend
                </code>
                <p>2. Start the React frontend:</p>
                <code className="block bg-muted p-3 rounded text-sm">
                  just develop frontend
                </code>
              </div>
            </div>
            {/* Counter section */}
            <div className="bg-card rounded-lg shadow-lg p-8 flex flex-col items-center justify-center gap-6">
              <h2 className="text-xl font-semibold">Demo Counter</h2>
              <div className="text-4xl font-bold text-primary">
                {counter !== null ? counter : "..."}
              </div>
              <Button variant="default" size="lg" onClick={incrementCounter}>
                Increment Counter
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            In development mode, edit{" "}
            <code className="text-primary">frontend/App.tsx</code> or{" "}
            <code className="text-primary">backend/server.py</code> and save to
            test Hot Module Reload
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Counter } from "@/services/counters";

type CounterCardProps = {
  counter: Counter;
  disabled: boolean;
  onIncrement: () => void;
  onDelete: () => void;
};

export function CounterCard({
  counter,
  disabled,
  onIncrement,
  onDelete,
}: CounterCardProps) {
  return (
    <article
      className="flex flex-col items-center gap-5 rounded-lg border-t-8 bg-card p-6 shadow-lg"
      style={{ borderTopColor: counter.color }}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: counter.color }}
          aria-hidden="true"
        />
        <span className="font-mono">{counter.color}</span>
      </div>
      <div className="text-5xl font-bold" aria-label={`Value ${counter.value}`}>
        {counter.value}
      </div>
      <div className="flex gap-2">
        <Button
          disabled={disabled}
          onClick={onIncrement}
          variant="outline"
          style={{ borderColor: counter.color }}
        >
          Increment Counter
        </Button>
        <Button
          aria-label={`Delete ${counter.color} counter`}
          disabled={disabled}
          onClick={onDelete}
          size="icon"
        >
          {/* The accessible label identifies the exact card while the compact
              icon keeps neighboring counter actions visually balanced. */}
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

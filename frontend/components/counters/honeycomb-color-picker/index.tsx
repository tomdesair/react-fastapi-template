import "./honeycomb-color-picker.css";

type ColorOption = {
  name: string;
  value: string;
};

const COLOR_ROWS: ColorOption[][] = [
  [
    { name: "Rose", value: "#f43f5e" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Yellow", value: "#eab308" },
    { name: "Lime", value: "#84cc16" },
  ],
  [
    { name: "Green", value: "#22c55e" },
    { name: "Emerald", value: "#10b981" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Sky", value: "#0ea5e9" },
    { name: "Blue", value: "#0000ff" },
    { name: "Indigo", value: "#6366f1" },
  ],
  [
    { name: "Violet", value: "#8b5cf6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Fuchsia", value: "#d946ef" },
    { name: "Pink", value: "#ec4899" },
    { name: "Brown", value: "#92400e" },
    { name: "Slate", value: "#475569" },
  ],
];

type HoneycombColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function HoneycombColorPicker({
  value,
  onChange,
}: HoneycombColorPickerProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-sm font-medium">
        Select a color for the new counter
      </legend>
      <div className="honeycomb-grid" aria-label="Counter color">
        {COLOR_ROWS.map((row, rowIndex) => (
          <div className="honeycomb-row" key={rowIndex}>
            {row.map((color) => (
              <label
                className="honeycomb-option"
                data-selected={value === color.value}
                key={color.value}
                title={`${color.name} (${color.value})`}
              >
                {/* Native radio semantics provide keyboard arrows and a shared
                    single-selection group without custom focus management. */}
                <input
                  className="sr-only"
                  type="radio"
                  name="counter-color"
                  value={color.value}
                  checked={value === color.value}
                  onChange={() => onChange(color.value)}
                />
                <span
                  className="honeycomb-cell"
                  style={{ backgroundColor: color.value }}
                />
                <span className="sr-only">{color.name}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-sm text-muted-foreground">
        {value}
      </p>
    </fieldset>
  );
}

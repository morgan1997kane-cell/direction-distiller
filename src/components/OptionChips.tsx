"use client";

interface OptionChipsProps<T extends string> {
  label: string;
  options: T[];
  value: T | T[];
  multiple?: boolean;
  onChange: (value: T | T[]) => void;
}

export function OptionChips<T extends string>({
  label,
  options,
  value,
  multiple = false,
  onChange,
}: OptionChipsProps<T>) {
  const values = Array.isArray(value) ? value : [value];

  function toggle(option: T) {
    if (!multiple) {
      onChange(option);
      return;
    }

    const next = values.includes(option)
      ? values.filter((item): item is T => item !== option)
      : [...values, option];
    onChange(next);
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-200">{label}</h3>
        {multiple ? <span className="text-xs text-zinc-500">可多选</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={[
                "border px-3.5 py-2 text-sm transition",
                active
                  ? "border-cyan-200/45 bg-cyan-300/[0.075] text-cyan-100"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-100",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

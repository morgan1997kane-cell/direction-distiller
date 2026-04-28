"use client";

import { examplePrompts } from "@/data/presets";
import type { ExamplePrompt } from "@/lib/types";

interface ExamplePromptsProps {
  onSelect: (example: ExamplePrompt) => void;
}

export function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/60">Starter Briefs</p>
          <h2 className="mt-2 text-lg font-medium text-zinc-100">从一个示例开始</h2>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {examplePrompts.map((example) => (
          <button
            key={example.title}
            type="button"
            onClick={() => onSelect(example)}
            className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.05]"
          >
            <span className="text-sm font-medium text-zinc-100">{example.title}</span>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">{example.brief}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

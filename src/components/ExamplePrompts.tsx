"use client";

import { examplePrompts } from "@/data/presets";
import type { ExamplePrompt } from "@/lib/types";

interface ExamplePromptsProps {
  onSelect: (example: ExamplePrompt) => void;
}

export function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/45">Starter Briefs</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-100">从一个样板 brief 开始</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {examplePrompts.map((example) => (
          <button
            key={example.title}
            type="button"
            onClick={() => onSelect(example)}
            className="border-t border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-cyan-300/35 hover:bg-cyan-300/[0.04]"
          >
            <span className="text-base font-medium text-zinc-100">{example.title}</span>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-500">{example.brief}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

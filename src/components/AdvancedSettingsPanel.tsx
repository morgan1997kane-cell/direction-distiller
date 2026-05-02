"use client";

import { useState } from "react";

interface AdvancedSettingsPanelProps {
  children: React.ReactNode;
  summary: string;
}

export function AdvancedSettingsPanel({ children, summary }: AdvancedSettingsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/35">Advanced</p>
          <h3 className="mt-1 text-sm font-medium text-zinc-300">AI 引擎设置</h3>
          <p className="mt-1 text-xs text-zinc-600">{summary}</p>
        </div>
        <span className="shrink-0 border border-white/10 bg-white/[0.02] px-2 py-1 text-xs text-zinc-500">{expanded ? "收起" : "展开"}</span>
      </button>

      {expanded ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

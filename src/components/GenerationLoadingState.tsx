"use client";

import { isSupportedProvider, PROVIDER_LABELS, type AIProvider } from "@/lib/aiProvider";

interface GenerationLoadingStateProps {
  provider: AIProvider;
  model: string;
  stage: string;
}

export function GenerationLoadingState({ provider, model, stage }: GenerationLoadingStateProps) {
  const isDemo = provider === "demo";
  const providerLabel = isSupportedProvider(provider) ? PROVIDER_LABELS[provider] : provider;
  const modeLabel = isDemo ? "AI Mode: Demo" : ["AI Mode: Live", providerLabel, model].filter(Boolean).join(" · ");
  const waitCopy = isDemo ? "Demo 结果会很快生成，请稍候。" : "Live 生成通常需要 15-40 秒，请稍候。";

  return (
    <section className="space-y-6">
      <header className="border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/50">Distilling Direction</p>
          <span className="border border-cyan-100/20 bg-cyan-300/[0.06] px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-cyan-50/80">
            {modeLabel}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.55)]" />
          <h2 className="text-2xl font-semibold text-zinc-50">{stage}</h2>
        </div>
        <p className="mt-3 text-sm text-zinc-500">{waitCopy}</p>
      </header>

      <section className="border border-white/10 bg-white/[0.02] p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-14" />
          <SkeletonBlock className="h-14 md:col-span-2" />
        </div>
        <SkeletonBlock className="mt-4 h-20" />
      </section>

      <section className="border border-cyan-100/15 bg-cyan-300/[0.035] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <SkeletonLine width="w-28" />
            <SkeletonLine width="mt-3 w-64 max-w-full" />
          </div>
          <div className="hidden h-12 w-12 rounded-full border border-cyan-100/20 bg-cyan-100/[0.05] md:block" />
        </div>
        <SkeletonBlock className="mt-5 h-24" />
      </section>

      <section className="space-y-4">
        <div>
          <SkeletonLine width="w-32" />
          <SkeletonLine width="mt-3 w-48" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {["safe", "bold", "execution"].map((item) => (
            <section key={item} className="border border-white/10 bg-zinc-950/60 p-4">
              <SkeletonLine width="w-20" />
              <SkeletonLine width="mt-4 w-40" />
              <SkeletonBlock className="mt-5 h-24" />
              <div className="mt-5 grid grid-cols-2 gap-2">
                <SkeletonBlock className="h-8" />
                <SkeletonBlock className="h-8" />
                <SkeletonBlock className="h-8" />
                <SkeletonBlock className="h-8" />
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonPanel title="Proposal Copy" />
        <SkeletonPanel title="Prompt Package" />
      </div>
      <SkeletonPanel title="Execution Advice" />
    </section>
  );
}

function SkeletonPanel({ title }: { title: string }) {
  return (
    <section className="border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">{title}</p>
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-100/50" />
      </div>
      <SkeletonBlock className="mt-4 h-24" />
      <SkeletonLine width="mt-4 w-5/6" />
      <SkeletonLine width="mt-3 w-2/3" />
    </section>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={["animate-pulse border border-white/10 bg-white/[0.045]", className].join(" ")} />;
}

function SkeletonLine({ width }: { width: string }) {
  return <div className={["h-3 animate-pulse bg-white/[0.08]", width].join(" ")} />;
}

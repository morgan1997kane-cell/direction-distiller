import type { RecommendedDirection } from "@/lib/types";

export function RecommendedDirectionCard({ recommended }: { recommended: RecommendedDirection }) {
  return (
    <section className="relative min-w-0 overflow-hidden border-y border-cyan-100/15 bg-[linear-gradient(135deg,rgba(226,232,240,0.11),rgba(255,255,255,0.028)_48%,rgba(8,9,11,0.28)_100%)] px-5 py-8 shadow-[0_42px_140px_rgba(0,0,0,0.28)] md:px-10 md:py-12">
      <div className="absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-cyan-100/45 to-transparent" />
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">Recommended Direction / 推荐方向</p>
      <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <h2 className="break-words text-5xl font-semibold leading-[1.02] text-zinc-50 md:text-7xl">{recommended.title}</h2>
          <p className="mt-8 max-w-4xl break-words border-l border-cyan-100/25 pl-5 text-xl leading-10 text-zinc-100 md:text-3xl md:leading-[3.3rem]">
            {recommended.core_sentence}
          </p>
        </div>
        <div className="self-end border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Why This Route</p>
          <p className="mt-4 text-sm leading-7 text-zinc-300">{recommended.reason}</p>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-zinc-500">
            从这里开始执行，而不是继续扩散。
          </p>
        </div>
      </div>
    </section>
  );
}

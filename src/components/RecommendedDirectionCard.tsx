import type { RecommendedDirection } from "@/lib/types";

export function RecommendedDirectionCard({ recommended }: { recommended: RecommendedDirection }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(226,232,240,0.12),rgba(255,255,255,0.04)_45%,rgba(8,9,11,0.5)_100%)] p-7 shadow-[0_48px_150px_rgba(0,0,0,0.3)] md:p-12">
      <div className="absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-cyan-100/45 to-transparent" />
      <span className="inline-flex border border-cyan-100/22 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100/75">
        Recommended Direction / 推荐方向
      </span>
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <h2 className="text-4xl font-semibold leading-tight text-zinc-50 md:text-6xl">{recommended.title}</h2>
          <p className="mt-8 max-w-3xl border-l border-cyan-100/25 pl-5 text-xl leading-10 text-zinc-100 md:text-2xl md:leading-[3rem]">
            {recommended.core_sentence}
          </p>
        </div>
        <div className="self-end border-l border-white/10 pl-6">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Why This Route</p>
          <p className="mt-5 text-sm leading-7 text-zinc-300">{recommended.reason}</p>
          <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-zinc-500">
            从这里开始执行，而不是继续扩散。
          </p>
        </div>
      </div>
    </section>
  );
}

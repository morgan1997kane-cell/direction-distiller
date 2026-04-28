import type { RecommendedDirection } from "@/lib/types";

export function RecommendedDirectionCard({ recommended }: { recommended: RecommendedDirection }) {
  return (
    <section className="relative overflow-hidden border border-cyan-200/25 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(255,255,255,0.045)_42%,rgba(0,0,0,0)_100%)] p-6 shadow-[0_30px_120px_rgba(34,211,238,0.08)] md:p-8">
      <div className="absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-cyan-100/70 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-1/2 bg-gradient-to-r from-cyan-100/30 to-transparent" />
      <span className="inline-flex border border-cyan-200/30 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
        Recommended Direction / 推荐方向
      </span>
      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-zinc-50 md:text-5xl">{recommended.title}</h2>
          <p className="mt-6 max-w-3xl border-l border-cyan-200/50 pl-4 text-lg leading-8 text-cyan-50 md:text-xl md:leading-9">
            {recommended.core_sentence}
          </p>
        </div>
        <div className="border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Why This Route</p>
          <p className="mt-4 text-sm leading-7 text-zinc-300">{recommended.reason}</p>
          <div className="mt-5 border-t border-white/10 pt-4 text-sm text-zinc-500">
            从这里开始执行，而不是继续扩散。
          </div>
        </div>
      </div>
    </section>
  );
}

import type { DirectionCandidate, RecommendedDirection } from "@/lib/types";

export function RecommendedDirectionCard({
  recommended,
  matchedCandidate,
  aiLabel,
}: {
  recommended: RecommendedDirection;
  matchedCandidate?: DirectionCandidate;
  aiLabel?: string;
}) {
  const keywords = [
    ...(matchedCandidate?.visual_keywords ?? []),
    ...(matchedCandidate?.mood_keywords ?? []),
  ].slice(0, 5);

  return (
    <section className="relative min-h-[320px] min-w-0 overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_14%_8%,rgba(125,211,252,0.24),transparent_28rem),radial-gradient(circle_at_86%_22%,rgba(244,244,245,0.1),transparent_24rem),linear-gradient(135deg,rgba(226,232,240,0.16),rgba(255,255,255,0.045)_42%,rgba(8,9,11,0.5)_100%)] px-5 py-10 shadow-[0_60px_220px_rgba(0,0,0,0.48)] md:px-10 md:py-12 lg:px-12 2xl:px-14">
      <div className="absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-cyan-100/45 to-transparent" />
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/55">System Recommended Direction</p>
      <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)] lg:items-end 2xl:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.7fr)]">
        <div className="min-w-0">
          <h2 className="max-w-6xl break-words text-5xl font-semibold leading-[0.98] text-zinc-50 sm:text-6xl md:text-7xl 2xl:text-8xl">{recommended.title}</h2>
          <p className="mt-6 max-w-5xl break-words text-2xl leading-10 text-zinc-100 md:text-3xl md:leading-[3.2rem] 2xl:text-4xl 2xl:leading-[3.8rem]">
            {recommended.core_sentence}
          </p>
          {keywords.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-white/10 bg-black/[0.18] px-3 py-1 text-xs text-zinc-300">
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="self-end rounded-[18px] border border-white/10 bg-black/25 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.2)]">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Why This Route</p>
          <p className="mt-4 text-sm leading-7 text-zinc-300">{recommended.reason}</p>
          <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-500">
            {matchedCandidate ? <p><span className="text-zinc-300">Matched</span> {matchedCandidate.type}</p> : null}
            {matchedCandidate ? <p><span className="text-zinc-300">Strength</span> {matchedCandidate.strength}</p> : null}
            {matchedCandidate ? <p><span className="text-zinc-300">Risk</span> {matchedCandidate.risk}</p> : null}
            {aiLabel ? <p><span className="text-zinc-300">AI</span> {aiLabel}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

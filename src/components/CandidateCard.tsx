import type { DirectionCandidate } from "@/lib/types";
import { ScoreBars } from "@/components/ScoreBars";

export function CandidateCard({ candidate }: { candidate: DirectionCandidate }) {
  const average = Math.round(
    (candidate.scores.clarity +
      candidate.scores.visual_control +
      candidate.scores.proposal_value +
      candidate.scores.execution_feasibility) /
      4,
  );

  return (
    <article className="rounded-lg border border-white/10 bg-zinc-950/80 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs text-cyan-200/70">{candidate.type}</span>
          <h3 className="mt-2 text-xl font-medium text-zinc-50">{candidate.title}</h3>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-center">
          <div className="font-mono text-lg text-zinc-50">{average}</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Score</div>
        </div>
      </div>
      <p className="text-sm leading-6 text-zinc-400">{candidate.one_line_concept}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-zinc-500">视觉关键词</p>
          <div className="flex flex-wrap gap-2">
            {candidate.visual_keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-white/[0.055] px-2.5 py-1 text-xs text-zinc-300">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-zinc-500">情绪关键词</p>
          <div className="flex flex-wrap gap-2">
            {candidate.mood_keywords.map((keyword) => (
              <span key={keyword} className="rounded-full bg-cyan-300/[0.08] px-2.5 py-1 text-xs text-cyan-100">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 text-sm leading-6 md:grid-cols-2">
        <p className="text-zinc-400">
          <span className="text-zinc-200">优势：</span>
          {candidate.strength}
        </p>
        <p className="text-zinc-400">
          <span className="text-zinc-200">风险：</span>
          {candidate.risk}
        </p>
      </div>

      <div className="mt-5">
        <ScoreBars scores={candidate.scores} />
      </div>
    </article>
  );
}

import type { DirectionCandidate } from "@/lib/types";

const typeTone: Record<DirectionCandidate["type"], string> = {
  稳妥型: "text-zinc-200",
  大胆型: "text-cyan-100",
  执行型: "text-emerald-100",
};

export function CandidateCard({ candidate }: { candidate: DirectionCandidate }) {
  const average = Math.round(
    (candidate.scores.clarity +
      candidate.scores.visual_control +
      candidate.scores.proposal_value +
      candidate.scores.execution_feasibility) /
      4,
  );

  return (
    <article className="flex h-full min-w-0 flex-col border-t border-white/10 bg-white/[0.025] p-5 transition hover:bg-white/[0.04] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`whitespace-nowrap text-xs uppercase tracking-[0.18em] ${typeTone[candidate.type]}`}>{candidate.type}</span>
        <span className="font-mono text-sm text-zinc-500">{average}</span>
      </div>

      <div className="mt-6 min-w-0">
        <h3 className="whitespace-normal break-words text-2xl font-medium leading-snug text-zinc-50 md:text-3xl">
          {candidate.title}
        </h3>
        <p className="mt-4 whitespace-normal break-words text-base leading-8 text-zinc-300">
          {candidate.one_line_concept}
        </p>
      </div>

      <KeywordGroup items={[...candidate.visual_keywords, ...candidate.mood_keywords].slice(0, 5)} />

      <div className="mt-7 grid min-w-0 gap-4 text-sm leading-7">
        <p className="whitespace-normal break-words border-l border-white/10 pl-4 text-zinc-400">
          <span className="text-zinc-200">优势：</span>
          {candidate.strength}
        </p>
        <p className="whitespace-normal break-words border-l border-white/10 pl-4 text-zinc-500">
          <span className="text-zinc-300">风险：</span>
          {candidate.risk}
        </p>
      </div>

      <div className="mt-auto pt-7">
        <div className="h-px w-full bg-white/10">
          <div className="h-px bg-cyan-100/35" style={{ width: `${average}%` }} />
        </div>
      </div>
    </article>
  );
}

function KeywordGroup({ items }: { items: string[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2">
      {items.map((keyword) => (
        <span key={keyword} className="text-xs leading-5 text-zinc-500">
          {keyword}
        </span>
      ))}
    </div>
  );
}

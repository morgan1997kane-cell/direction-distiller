import type { DirectionCandidate } from "@/lib/types";
import { ScoreBars } from "@/components/ScoreBars";

const typeTone: Record<DirectionCandidate["type"], string> = {
  稳妥型: "border-zinc-300/20 text-zinc-200",
  大胆型: "border-cyan-200/30 text-cyan-100",
  执行型: "border-emerald-200/25 text-emerald-100",
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
    <article className="flex min-w-[18rem] flex-col bg-[#101216]/85 p-5 transition hover:bg-[#13161b]/90">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`whitespace-nowrap border px-3 py-1 text-xs ${typeTone[candidate.type]}`}>
          {candidate.type}
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-zinc-600">Strategy Card</span>
      </div>

      <div className="mt-6">
        <h3 className="whitespace-normal break-words text-2xl font-medium leading-snug text-zinc-50">
          {candidate.title}
        </h3>
        <p className="mt-4 whitespace-normal break-words text-base leading-8 text-zinc-300">
          {candidate.one_line_concept}
        </p>
      </div>

      <div className="mt-7 grid gap-5">
        <KeywordGroup label="视觉关键词" items={candidate.visual_keywords} />
        <KeywordGroup label="情绪关键词" items={candidate.mood_keywords} accent />
      </div>

      <div className="mt-7 grid gap-4 text-sm leading-7">
        <p className="whitespace-normal break-words border-l border-white/10 pl-4 text-zinc-400">
          <span className="text-zinc-200">优势：</span>
          {candidate.strength}
        </p>
        <p className="whitespace-normal break-words border-l border-white/10 pl-4 text-zinc-500">
          <span className="text-zinc-300">风险：</span>
          {candidate.risk}
        </p>
      </div>

      <div className="mt-7 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">Direction Score</p>
          <p className="font-mono text-2xl text-zinc-100">{average}</p>
        </div>
        <ScoreBars scores={candidate.scores} />
      </div>
    </article>
  );
}

function KeywordGroup({ label, items, accent = false }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div>
      <p className="mb-3 text-xs text-zinc-600">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((keyword) => (
          <span
            key={keyword}
            className={[
              "border px-2.5 py-1.5 text-xs leading-none",
              accent
                ? "border-cyan-200/15 bg-cyan-300/[0.055] text-cyan-100/80"
                : "border-white/10 bg-white/[0.035] text-zinc-300",
            ].join(" ")}
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

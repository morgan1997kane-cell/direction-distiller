import type { DirectionCandidate } from "@/lib/types";
import { ScoreBars } from "@/components/ScoreBars";

const typeTone: Record<DirectionCandidate["type"], string> = {
  稳妥型: "border-zinc-400/20 text-zinc-200",
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
    <article className="flex h-full flex-col border border-white/10 bg-zinc-950/80 p-4 transition hover:border-white/20 hover:bg-zinc-900/70">
      <div className="flex items-start justify-between gap-4">
        <span className={`border px-2.5 py-1 text-xs ${typeTone[candidate.type]}`}>{candidate.type}</span>
        <div className="border border-white/10 bg-white/[0.035] px-3 py-2 text-right">
          <div className="font-mono text-xl text-zinc-50">{average}</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">Score</div>
        </div>
      </div>

      <h3 className="mt-5 text-xl font-medium leading-snug text-zinc-50">{candidate.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{candidate.one_line_concept}</p>

      <div className="mt-5 space-y-4">
        <KeywordGroup label="视觉关键词" items={candidate.visual_keywords} />
        <KeywordGroup label="情绪关键词" items={candidate.mood_keywords} accent />
      </div>

      <div className="mt-5 grid gap-3 text-sm leading-6">
        <p className="border-l border-white/10 pl-3 text-zinc-400">
          <span className="text-zinc-200">优势：</span>
          {candidate.strength}
        </p>
        <p className="border-l border-white/10 pl-3 text-zinc-500">
          <span className="text-zinc-300">风险：</span>
          {candidate.risk}
        </p>
      </div>

      <div className="mt-auto pt-5">
        <ScoreBars scores={candidate.scores} />
      </div>
    </article>
  );
}

function KeywordGroup({ label, items, accent = false }: { label: string; items: string[]; accent?: boolean }) {
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-600">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((keyword) => (
          <span
            key={keyword}
            className={[
              "border px-2 py-1 text-xs",
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

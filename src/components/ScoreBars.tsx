import type { DirectionScores } from "@/lib/types";

const scoreLabels: Array<[keyof DirectionScores, string]> = [
  ["clarity", "清晰度"],
  ["visual_control", "可控性"],
  ["proposal_value", "提案值"],
  ["execution_feasibility", "可行性"],
];

export function ScoreBars({ scores }: { scores: DirectionScores }) {
  return (
    <div className="grid gap-3">
      {scoreLabels.map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">{label}</span>
            <span className="font-mono text-zinc-200">{scores[key]}</span>
          </div>
          <div className="h-1 overflow-hidden bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-zinc-400 via-cyan-200 to-zinc-100"
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

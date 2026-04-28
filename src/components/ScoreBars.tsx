import type { DirectionScores } from "@/lib/types";

const scoreLabels: Array<[keyof DirectionScores, string]> = [
  ["clarity", "清晰度"],
  ["visual_control", "画面可控性"],
  ["proposal_value", "提案价值"],
  ["execution_feasibility", "执行可行性"],
];

export function ScoreBars({ scores }: { scores: DirectionScores }) {
  return (
    <div className="space-y-3">
      {scoreLabels.map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">{label}</span>
            <span className="font-mono text-zinc-200">{scores[key]}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-slate-100"
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

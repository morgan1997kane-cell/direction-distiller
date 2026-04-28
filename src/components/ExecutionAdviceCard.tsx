import type { ExecutionAdvice } from "@/lib/types";

const rows: Array<[keyof ExecutionAdvice, string, string]> = [
  ["first_step", "第一件事", "01"],
  ["recommended_workflow", "推荐工作流", "02"],
  ["risk_warning", "风险提醒", "03"],
];

export function ExecutionAdviceCard({ advice }: { advice: ExecutionAdvice }) {
  return (
    <section className="border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Action Plan</p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-50">下一步执行建议</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {rows.map(([key, title, index]) => (
          <article key={key} className="border border-white/10 bg-black/25 p-4">
            <span className="font-mono text-xs text-cyan-100/50">{index}</span>
            <h3 className="mt-3 text-sm font-medium text-zinc-100">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{advice[key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

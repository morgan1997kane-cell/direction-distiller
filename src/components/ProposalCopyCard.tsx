import type { ProposalCopy } from "@/lib/types";

const copyRows: Array<[keyof ProposalCopy, string, string]> = [
  ["short_pitch", "短 pitch", "Slide Subtitle"],
  ["client_facing_description", "客户可读描述", "Client Narrative"],
  ["internal_direction_note", "内部执行备注", "Team Note"],
];

export function ProposalCopyCard({ proposalCopy }: { proposalCopy: ProposalCopy }) {
  return (
    <section className="border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Proposal Copy</p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-50">提案文案</h2>
      <div className="mt-5 grid gap-3">
        {copyRows.map(([key, title, label]) => (
          <article key={key} className="border border-white/10 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
              <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-600">{label}</span>
            </div>
            <p className="text-sm leading-7 text-zinc-300">{proposalCopy[key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

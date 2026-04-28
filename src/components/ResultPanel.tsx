"use client";

import type { DirectionInput, DirectionResult } from "@/lib/types";
import { CandidateCard } from "@/components/CandidateCard";
import { DirectionPackageCard } from "@/components/DirectionPackageCard";
import { ExecutionAdviceCard } from "@/components/ExecutionAdviceCard";
import { PromptPackageCard } from "@/components/PromptPackageCard";
import { ProposalCopyCard } from "@/components/ProposalCopyCard";
import { RecommendedDirectionCard } from "@/components/RecommendedDirectionCard";
import { copyText, formatDirectionMarkdown, formatPromptMarkdown } from "@/lib/copy";

interface ResultPanelProps {
  result: DirectionResult;
  input: DirectionInput;
  saved: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  onClear: () => void;
}

export function ResultPanel({ result, input, saved, onSave, onRegenerate, onClear }: ResultPanelProps) {
  return (
    <section className="space-y-6">
      <header className="border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/50">Distilled Proposal</p>
        <h2 className="mt-3 text-3xl font-semibold text-zinc-50">方向压缩结果</h2>
      </header>

      <section className="border border-white/10 bg-white/[0.02] p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <SummaryItem label="项目类型" value={result.project_type} />
          <SummaryItem label="输出目标" value={result.output_goal} />
          <SummaryItem label="参考图" value={`${input.referenceImages.length} 张`} />
          <SummaryItem label="风格倾向" value={result.style_tags.join("、")} wide />
        </div>
        <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-zinc-500">{result.input_summary}</p>
      </section>

      {result.reference_image_summary.length > 0 ? (
        <section className="border border-white/10 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-medium text-zinc-100">参考图模拟摘要</h3>
            <span className="text-xs text-zinc-600">Reference Notes</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {result.reference_image_summary.map((image) => (
              <div key={image.image_id} className="border border-white/10 bg-black/25 p-3">
                <p className="truncate text-sm text-zinc-200">{image.file_name}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {image.observed_style} · {image.color_tone} · {image.composition_notes}
                </p>
                <p className="mt-2 text-xs text-cyan-100/70">{image.usable_elements.join("、")}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <RecommendedDirectionCard recommended={result.recommended_direction} />

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">Direction Routes</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">三个方向候选</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {result.candidate_directions.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </section>

      <DirectionPackageCard directionPackage={result.direction_package} />
      <ProposalCopyCard proposalCopy={result.proposal_copy} />
      <PromptPackageCard promptPackage={result.prompt_package} />
      <ExecutionAdviceCard advice={result.execution_advice} />

      <div className="sticky bottom-4 z-20 flex flex-wrap gap-2 border border-white/10 bg-black/85 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <ActionButton onClick={() => copyText(formatDirectionMarkdown(result))}>复制方向包</ActionButton>
        <ActionButton onClick={() => copyText(formatPromptMarkdown(result))}>复制 Prompt</ActionButton>
        <ActionButton onClick={onSave}>{saved ? "已保存" : "保存到历史"}</ActionButton>
        <ActionButton onClick={onRegenerate}>重新生成</ActionButton>
        <ActionButton onClick={onClear} muted>
          清空输入
        </ActionButton>
      </div>
    </section>
  );
}

function SummaryItem({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={["border-t border-white/10 pt-3", wide ? "md:col-span-2" : ""].join(" ")}>
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-1 text-sm text-zinc-200">{value || "未选择"}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  muted = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border px-4 py-2 text-sm transition",
        muted
          ? "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-100"
          : "border-cyan-200/30 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

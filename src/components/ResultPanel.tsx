"use client";

import type { DirectionInput, DirectionResult } from "@/lib/types";
import { CandidateCard } from "@/components/CandidateCard";
import { DirectionPackageCard } from "@/components/DirectionPackageCard";
import { PromptPackageCard } from "@/components/PromptPackageCard";
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
    <section className="space-y-5">
      <div className="rounded-lg border border-cyan-200/20 bg-cyan-200/[0.045] p-5 shadow-[0_0_80px_rgba(34,211,238,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/70">Distilled Result</p>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-50">输入摘要</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <SummaryItem label="项目类型" value={result.project_type} />
          <SummaryItem label="输出目标" value={result.output_goal} />
          <SummaryItem label="参考图数量" value={`${input.referenceImages.length} 张`} />
          <SummaryItem label="风格倾向" value={result.style_tags.join("、")} />
        </div>
        <p className="mt-5 text-sm leading-7 text-zinc-300">{result.input_summary}</p>
      </div>

      {result.reference_image_summary.length > 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-medium text-zinc-50">参考图模拟摘要</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {result.reference_image_summary.map((image) => (
              <div key={image.image_id} className="rounded-md border border-white/10 bg-black/30 p-3">
                <p className="truncate text-sm text-zinc-200">{image.file_name}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {image.observed_style} · {image.color_tone} · {image.composition_notes}
                </p>
                <p className="mt-2 text-xs text-cyan-100/70">{image.usable_elements.join("、")}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Three Routes</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">三个方向候选</h2>
        </div>
        <div className="grid gap-4">
          {result.candidate_directions.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>

      <section className="rounded-lg border border-cyan-200/30 bg-gradient-to-br from-cyan-300/[0.12] via-white/[0.04] to-transparent p-6">
        <span className="inline-flex border border-cyan-200/30 bg-black/30 px-3 py-1 text-xs text-cyan-100">
          系统推荐
        </span>
        <h2 className="mt-4 text-3xl font-semibold text-zinc-50">{result.recommended_direction.title}</h2>
        <p className="mt-4 text-sm leading-7 text-zinc-300">{result.recommended_direction.reason}</p>
        <p className="mt-4 border-l border-cyan-200/50 pl-4 text-lg leading-8 text-cyan-50">
          {result.recommended_direction.core_sentence}
        </p>
      </section>

      <DirectionPackageCard directionPackage={result.direction_package} />

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-medium text-zinc-50">提案文案</h2>
        <div className="mt-5 grid gap-4">
          <CopyBlock label="短 pitch" value={result.proposal_copy.short_pitch} />
          <CopyBlock label="客户可读描述" value={result.proposal_copy.client_facing_description} />
          <CopyBlock label="内部执行备注" value={result.proposal_copy.internal_direction_note} />
        </div>
      </section>

      <PromptPackageCard promptPackage={result.prompt_package} />

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-xl font-medium text-zinc-50">下一步执行建议</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <CopyBlock label="建议第一步" value={result.execution_advice.first_step} />
          <CopyBlock label="推荐工作流" value={result.execution_advice.recommended_workflow} />
          <CopyBlock label="风险提醒" value={result.execution_advice.risk_warning} />
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-black/80 p-3 backdrop-blur-md">
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 pt-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-100">{value || "未选择"}</p>
    </div>
  );
}

function CopyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-2 text-sm leading-7 text-zinc-300">{value}</p>
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
        "rounded-md border px-4 py-2 text-sm transition",
        muted
          ? "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-100"
          : "border-cyan-200/30 bg-cyan-300/10 text-cyan-50 hover:bg-cyan-300/15",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

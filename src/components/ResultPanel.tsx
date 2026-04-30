"use client";

import { useState } from "react";
import type {
  DirectionCandidate,
  DirectionInput,
  DirectionPackage,
  DirectionResult,
  ExecutionAdvice,
  PromptPackage,
  ProposalCopy,
  RecommendedDirection,
} from "@/lib/types";
import type { AIProvider } from "@/lib/aiProvider";
import { CandidateCard } from "@/components/CandidateCard";
import { DirectionPackageCard } from "@/components/DirectionPackageCard";
import { EditableSection } from "@/components/EditableSection";
import { ExecutionAdviceCard } from "@/components/ExecutionAdviceCard";
import { PromptPackageCard } from "@/components/PromptPackageCard";
import { ProposalCopyCard } from "@/components/ProposalCopyCard";
import { RecommendedDirectionCard } from "@/components/RecommendedDirectionCard";
import { isSupportedProvider, PROVIDER_LABELS } from "@/lib/aiProvider";
import { copyText, formatDirectionMarkdown, formatPromptMarkdown } from "@/lib/copy";
import { generateDirectionResult } from "@/lib/mockGenerator";
import { normalizeDirectionResult } from "@/lib/directionSchema";
import { refineSection, type RefineSectionType } from "@/lib/refineSection";

interface ResultPanelProps {
  result: DirectionResult;
  input: DirectionInput;
  provider: AIProvider;
  model: string;
  saved: boolean;
  onResultChange: (result: DirectionResult) => void;
  onSave: () => void;
  onRegenerate: () => void;
  onClear: () => void;
}

export function ResultPanel({
  result,
  input,
  provider,
  model,
  saved,
  onResultChange,
  onSave,
  onRegenerate,
  onClear,
}: ResultPanelProps) {
  const [regeneratingKey, setRegeneratingKey] = useState("");
  const [notice, setNotice] = useState("");
  const providerLabel =
    result.ai_provider && isSupportedProvider(result.ai_provider) ? PROVIDER_LABELS[result.ai_provider] : result.ai_provider;
  const liveLabel = ["Live", providerLabel, result.ai_model].filter(Boolean).join(" · ");

  function updateResult(next: Partial<DirectionResult>) {
    setNotice("");
    onResultChange({
      ...result,
      ...next,
      prompt_package: next.prompt_package ?? result.prompt_package,
    });
  }

  function fallbackResult() {
    return normalizeDirectionResult(generateDirectionResult(input), input, "demo");
  }

  async function regenerateSection<T>(
    sectionType: RefineSectionType,
    apply: (section: T) => DirectionResult,
    fallback: (demoResult: DirectionResult) => T,
    instruction: string,
    key: string,
    candidateId?: string,
  ) {
    setRegeneratingKey(key);
    setNotice("");

    try {
      if (provider === "demo") {
        throw new Error("Demo provider refines locally");
      }

      const section = (await refineSection({
        sectionType,
        currentResult: result,
        brief: input,
        provider,
        model,
        optionalInstruction: instruction,
        candidateId,
      })) as T;

      onResultChange(apply(section));
    } catch (error) {
      console.warn("Section refinement failed, using demo section fallback.", error);
      const demo = fallbackResult();
      onResultChange(apply(fallback(demo)));
      setNotice("局部重生成暂时不可用，已用 Demo 内容补齐当前区块。");
    } finally {
      setRegeneratingKey("");
    }
  }

  function copyCandidate(candidate: DirectionCandidate) {
    return [
      `${candidate.type} · ${candidate.title}`,
      candidate.one_line_concept,
      `视觉关键词：${candidate.visual_keywords.join("、")}`,
      `情绪关键词：${candidate.mood_keywords.join("、")}`,
      `优势：${candidate.strength}`,
      `风险：${candidate.risk}`,
    ].join("\n");
  }

  return (
    <section className="space-y-6">
      <header className="border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/50">Distilled Proposal</p>
          <span className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
            AI Mode: {result.ai_mode === "live" ? liveLabel : "Demo"}
          </span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold text-zinc-50">方向压缩结果</h2>
        {notice ? <p className="mt-3 text-sm text-amber-100/80">{notice}</p> : null}
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
            <h3 className="text-sm font-medium text-zinc-100">参考图摘要</h3>
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

      <EditableSection<RecommendedDirection>
        title="Recommended Direction"
        label="推荐方向"
        value={result.recommended_direction}
        copyTextValue={`${result.recommended_direction.title}\n${result.recommended_direction.core_sentence}\n${result.recommended_direction.reason}`}
        isRegenerating={regeneratingKey === "recommended_direction"}
        onSave={(recommended_direction) => updateResult({ recommended_direction })}
        onRegenerate={(instruction) =>
          regenerateSection<RecommendedDirection>(
            "recommended_direction",
            (recommended_direction) => ({ ...result, recommended_direction }),
            (demo) => demo.recommended_direction,
            instruction,
            "recommended_direction",
          )
        }
      >
        <RecommendedDirectionCard recommended={result.recommended_direction} />
      </EditableSection>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">Direction Routes</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">三个方向候选</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {result.candidate_directions.map((candidate, index) => (
            <EditableSection<DirectionCandidate>
              key={candidate.id}
              title={`${candidate.type} · Candidate ${index + 1}`}
              value={candidate}
              copyTextValue={copyCandidate(candidate)}
              isRegenerating={regeneratingKey === candidate.id}
              onSave={(nextCandidate) =>
                updateResult({
                  candidate_directions: result.candidate_directions.map((item) =>
                    item.id === candidate.id ? nextCandidate : item,
                  ),
                })
              }
              onRegenerate={(instruction) =>
                regenerateSection<DirectionCandidate>(
                  "candidate_direction",
                  (nextCandidate) => ({
                    ...result,
                    candidate_directions: result.candidate_directions.map((item) =>
                      item.id === candidate.id ? { ...nextCandidate, id: candidate.id, type: candidate.type } : item,
                    ),
                  }),
                  (demo) => demo.candidate_directions[index] ?? demo.candidate_directions[0],
                  instruction,
                  candidate.id,
                  candidate.id,
                )
              }
            >
              <CandidateCard candidate={candidate} />
            </EditableSection>
          ))}
        </div>
      </section>

      <EditableSection<DirectionPackage>
        title="Direction Package"
        label="方向包"
        value={result.direction_package}
        isRegenerating={regeneratingKey === "direction_package"}
        onSave={(direction_package) => updateResult({ direction_package })}
        onRegenerate={(instruction) =>
          regenerateSection<DirectionPackage>(
            "direction_package",
            (direction_package) => ({ ...result, direction_package }),
            (demo) => demo.direction_package,
            instruction,
            "direction_package",
          )
        }
      >
        <DirectionPackageCard directionPackage={result.direction_package} />
      </EditableSection>

      <EditableSection<ProposalCopy>
        title="Proposal Copy"
        label="提案文案"
        value={result.proposal_copy}
        isRegenerating={regeneratingKey === "proposal_copy"}
        onSave={(proposal_copy) => updateResult({ proposal_copy })}
        onRegenerate={(instruction) =>
          regenerateSection<ProposalCopy>(
            "proposal_copy",
            (proposal_copy) => ({ ...result, proposal_copy }),
            (demo) => demo.proposal_copy,
            instruction,
            "proposal_copy",
          )
        }
      >
        <ProposalCopyCard proposalCopy={result.proposal_copy} />
      </EditableSection>

      <EditableSection<PromptPackage>
        title="Prompt Package"
        label="Prompt 草稿"
        value={result.prompt_package}
        copyTextValue={formatPromptMarkdown(result)}
        isRegenerating={regeneratingKey === "prompt_package"}
        onSave={(prompt_package) => updateResult({ prompt_package })}
        onRegenerate={(instruction) =>
          regenerateSection<PromptPackage>(
            "prompt_package",
            (prompt_package) => ({ ...result, prompt_package }),
            (demo) => demo.prompt_package,
            instruction,
            "prompt_package",
          )
        }
      >
        <PromptPackageCard promptPackage={result.prompt_package} />
      </EditableSection>

      <EditableSection<ExecutionAdvice>
        title="Execution Advice"
        label="执行建议"
        value={result.execution_advice}
        isRegenerating={regeneratingKey === "execution_advice"}
        onSave={(execution_advice) => updateResult({ execution_advice })}
        onRegenerate={(instruction) =>
          regenerateSection<ExecutionAdvice>(
            "execution_advice",
            (execution_advice) => ({ ...result, execution_advice }),
            (demo) => demo.execution_advice,
            instruction,
            "execution_advice",
          )
        }
      >
        <ExecutionAdviceCard advice={result.execution_advice} />
      </EditableSection>

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

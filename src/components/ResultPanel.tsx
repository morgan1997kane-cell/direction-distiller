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
import { CollapsibleSection, EditableSection } from "@/components/EditableSection";
import { ExecutionAdviceCard } from "@/components/ExecutionAdviceCard";
import { ExportPanel } from "@/components/ExportPanel";
import { PromptPackageCard } from "@/components/PromptPackageCard";
import { ProposalCopyCard } from "@/components/ProposalCopyCard";
import { RecommendedDirectionCard } from "@/components/RecommendedDirectionCard";
import {
  CandidateEditForm,
  DirectionPackageEditForm,
  ExecutionAdviceEditForm,
  PromptPackageEditForm,
  ProposalCopyEditForm,
  RecommendedEditForm,
} from "@/components/SectionEditForms";
import { isSupportedProvider, PROVIDER_LABELS } from "@/lib/aiProvider";
import { copyText, formatDirectionMarkdown, formatPromptMarkdown } from "@/lib/copy";
import { normalizeDirectionResult } from "@/lib/directionSchema";
import { generateDirectionResult } from "@/lib/mockGenerator";
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

  function short(value: string, length = 96) {
    return value.length > length ? `${value.slice(0, length)}...` : value;
  }

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

  function copyDirectionPackage(directionPackage: DirectionPackage) {
    return [
      `核心概念：${directionPackage.core_concept}`,
      `情绪：${directionPackage.mood.join("、")}`,
      `材质：${directionPackage.material.join("、")}`,
      `光线：${directionPackage.lighting.join("、")}`,
      `构图：${directionPackage.composition.join("、")}`,
      `色彩：${directionPackage.color_palette.join("、")}`,
      `避免：${directionPackage.do_not.join("、")}`,
    ].join("\n");
  }

  function copyProposalCopy(proposalCopy: ProposalCopy) {
    return [
      `短 Pitch：${proposalCopy.short_pitch}`,
      `客户可读描述：${proposalCopy.client_facing_description}`,
      `内部执行备注：${proposalCopy.internal_direction_note}`,
    ].join("\n\n");
  }

  function copyExecutionAdvice(advice: ExecutionAdvice) {
    return [
      `第一步：${advice.first_step}`,
      `推荐工作流：${advice.recommended_workflow}`,
      `风险提醒：${advice.risk_warning}`,
    ].join("\n\n");
  }

  return (
    <section className="space-y-8 pb-32">
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
        <CollapsibleSection
          title="Reference Notes"
          label="参考图摘要"
          description="仅基于文件名、数量和 MIME 类型形成文本上下文，不做真实图片识别。"
          summary={`${result.reference_image_summary.length} 张参考图 · ${result.reference_image_summary
            .map((image) => image.file_name)
            .slice(0, 2)
            .join("、")}`}
          defaultExpanded={false}
        >
          <div className="grid gap-3 md:grid-cols-2">
            {result.reference_image_summary.map((image) => (
              <div key={image.image_id} className="min-w-0 border border-white/10 bg-black/25 p-3">
                <p className="truncate text-sm text-zinc-200">{image.file_name}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {image.observed_style} · {image.color_tone} · {image.composition_notes}
                </p>
                <p className="mt-2 text-xs text-cyan-100/70">{image.usable_elements.join("、")}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      <EditableSection<RecommendedDirection>
        title="Recommended Direction"
        label="推荐方向"
        description="系统推荐的主方向，适合先拿来进入提案判断。"
        summary={short(result.recommended_direction.core_sentence)}
        defaultExpanded
        value={result.recommended_direction}
        copyTextValue={`${result.recommended_direction.title}\n${result.recommended_direction.core_sentence}\n${result.recommended_direction.reason}`}
        isRegenerating={regeneratingKey === "recommended_direction"}
        onSave={(recommended_direction) => updateResult({ recommended_direction })}
        renderEditor={(props) => <RecommendedEditForm {...props} />}
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

      <CollapsibleSection
        title="Candidate Directions"
        label="三个方向候选"
        description="三个候选用于比较风险、传播感和执行效率；每张卡片都可以单独编辑、复制或局部重生成。"
        summary={`3 个候选 · ${result.candidate_directions.map((candidate) => candidate.type).join(" / ")}`}
        defaultExpanded
      >
        <div className="grid items-start gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {result.candidate_directions.map((candidate, index) => (
            <EditableSection<DirectionCandidate>
              key={candidate.id}
              title={`${candidate.type} · Candidate ${index + 1}`}
              description={short(candidate.one_line_concept, 72)}
              summary={`${candidate.title} · ${short(candidate.one_line_concept, 70)}`}
              defaultExpanded
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
              renderEditor={(props) => <CandidateEditForm {...props} />}
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
      </CollapsibleSection>

      <EditableSection<DirectionPackage>
        title="Direction Package"
        label="视觉方向包"
        description="把推荐方向整理成可执行的视觉语言，包含情绪、材质、光线、构图和禁忌项。"
        summary={`${short(result.direction_package.core_concept)} · 展开查看材质 / 光线 / 构图 / 禁止项`}
        defaultExpanded={false}
        value={result.direction_package}
        copyTextValue={copyDirectionPackage(result.direction_package)}
        isRegenerating={regeneratingKey === "direction_package"}
        onSave={(direction_package) => updateResult({ direction_package })}
        renderEditor={(props) => <DirectionPackageEditForm {...props} />}
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
        description="适合复制到提案页或团队沟通中的文字版本。"
        summary={short(result.proposal_copy.short_pitch)}
        defaultExpanded={false}
        value={result.proposal_copy}
        copyTextValue={copyProposalCopy(result.proposal_copy)}
        isRegenerating={regeneratingKey === "proposal_copy"}
        onSave={(proposal_copy) => updateResult({ proposal_copy })}
        renderEditor={(props) => <ProposalCopyEditForm {...props} />}
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
        description="中英双版本 Prompt，用于首轮图像模型探索。"
        summary={`中文版 / English Version · ${short(result.prompt_package.zh?.main_prompt ?? result.prompt_package.main_prompt, 72)}`}
        defaultExpanded={false}
        value={result.prompt_package}
        copyTextValue={formatPromptMarkdown(result)}
        isRegenerating={regeneratingKey === "prompt_package"}
        onSave={(prompt_package) => updateResult({ prompt_package })}
        renderEditor={(props) => <PromptPackageEditForm {...props} />}
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
        label="下一步执行建议"
        description="下一步制作顺序、工作流和主要风险提醒。"
        summary={short(result.execution_advice.first_step)}
        defaultExpanded={false}
        value={result.execution_advice}
        copyTextValue={copyExecutionAdvice(result.execution_advice)}
        isRegenerating={regeneratingKey === "execution_advice"}
        onSave={(execution_advice) => updateResult({ execution_advice })}
        renderEditor={(props) => <ExecutionAdviceEditForm {...props} />}
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

      <ExportPanel result={result} />

      <div className="sticky bottom-4 z-20 flex max-h-32 flex-wrap gap-2 overflow-y-auto border border-white/10 bg-black/85 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
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

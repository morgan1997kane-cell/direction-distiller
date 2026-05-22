"use client";

import { useState, type ReactNode } from "react";
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
  edited?: boolean;
  projectBar?: ReactNode;
  onResultChange: (result: DirectionResult) => void;
  onSave: () => void;
  onRegenerate: () => void;
  onClear: () => void;
  onExport?: () => void;
}

export function ResultPanel({
  result,
  input,
  provider,
  model,
  saved,
  edited = false,
  projectBar,
  onResultChange,
  onSave,
  onRegenerate,
  onClear,
  onExport,
}: ResultPanelProps) {
  const [regeneratingKey, setRegeneratingKey] = useState("");
  const [notice, setNotice] = useState("");
  const providerLabel =
    result.ai_provider && isSupportedProvider(result.ai_provider) ? PROVIDER_LABELS[result.ai_provider] : result.ai_provider;
  const liveLabel = ["Live", providerLabel, result.ai_model].filter(Boolean).join(" / ");
  const matchedRecommended = result.candidate_directions.find((candidate) => candidate.id === result.recommended_direction.candidate_id);

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
      setNotice("Section regeneration is temporarily using Demo content for this block.");
    } finally {
      setRegeneratingKey("");
    }
  }

  function copyCandidate(candidate: DirectionCandidate) {
    return [
      `${candidate.type} / ${candidate.title}`,
      candidate.one_line_concept,
      `Visual keywords: ${candidate.visual_keywords.join(", ")}`,
      `Mood keywords: ${candidate.mood_keywords.join(", ")}`,
      `Strength: ${candidate.strength}`,
      `Risk: ${candidate.risk}`,
    ].join("\n");
  }

  function copyDirectionPackage(directionPackage: DirectionPackage) {
    return [
      `Core concept: ${directionPackage.core_concept}`,
      `Mood: ${directionPackage.mood.join(", ")}`,
      `Material: ${directionPackage.material.join(", ")}`,
      `Lighting: ${directionPackage.lighting.join(", ")}`,
      `Composition: ${directionPackage.composition.join(", ")}`,
      `Color palette: ${directionPackage.color_palette.join(", ")}`,
      `Do not: ${directionPackage.do_not.join(", ")}`,
    ].join("\n");
  }

  function copyProposalCopy(proposalCopy: ProposalCopy) {
    return [
      `Short pitch: ${proposalCopy.short_pitch}`,
      `Client copy: ${proposalCopy.client_facing_description}`,
      `Internal note: ${proposalCopy.internal_direction_note}`,
    ].join("\n\n");
  }

  function copyExecutionAdvice(advice: ExecutionAdvice) {
    return [
      `First step: ${advice.first_step}`,
      `Recommended workflow: ${advice.recommended_workflow}`,
      `Risk warning: ${advice.risk_warning}`,
    ].join("\n\n");
  }

  return (
    <section className="relative min-w-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_16%_0%,rgba(125,211,252,0.16),transparent_32rem),radial-gradient(circle_at_94%_8%,rgba(244,244,245,0.08),transparent_28rem),linear-gradient(180deg,rgba(255,255,255,0.058),rgba(255,255,255,0.018)_34%,rgba(4,5,7,0.38))] p-3 pb-32 shadow-[0_60px_220px_rgba(0,0,0,0.52)] sm:p-5 lg:p-6 2xl:p-7">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-cyan-100/20 bg-cyan-100/[0.055] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-50/75">
          Reference-led workspace · v0.4.7.1
        </span>
        <span className="text-xs text-zinc-600">Workspace Shell / Recommended Stage / Candidate Board / Details Stack</span>
      </div>

      {projectBar ? <div className="mb-7">{projectBar}</div> : null}
      {notice ? <p className="mb-5 rounded-[14px] border border-amber-100/15 bg-amber-100/[0.04] px-4 py-3 text-sm text-amber-100/80">{notice}</p> : null}

      <EditableSection<RecommendedDirection>
        title="Recommended Direction"
        label="Recommended"
        summary={short(result.recommended_direction.core_sentence)}
        defaultExpanded
        presentation="stage"
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
        <RecommendedDirectionCard
          recommended={result.recommended_direction}
          matchedCandidate={matchedRecommended}
          aiLabel={result.ai_mode === "live" ? liveLabel : "Demo"}
        />
      </EditableSection>

      <section className="mt-10 min-w-0">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/38">Candidate Board</p>
            <h3 className="mt-2 text-3xl font-semibold leading-tight text-zinc-50 md:text-5xl">
              Three routes, one decision field
            </h3>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-500">
            A quieter comparison board for safe, bold, and execution-led routes. Details remain editable without turning each card into a report.
          </p>
        </div>

        <div className="grid min-w-0 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:gap-5">
          {result.candidate_directions.map((candidate, index) => (
            <EditableSection<DirectionCandidate>
              key={candidate.id}
              title={`${candidate.type} / Candidate ${index + 1}`}
              summary={`${candidate.title} / ${short(candidate.one_line_concept, 70)}`}
              defaultExpanded
              presentation="card"
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
      </section>

      <section className="mt-10 min-w-0 rounded-[24px] border border-white/[0.07] bg-black/[0.18] px-4 py-6 md:px-7 md:py-8">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-600">Details Stack</p>
            <h3 className="mt-2 text-2xl font-semibold text-zinc-100 md:text-4xl">Proposal details, progressively opened</h3>
          </div>
          <p className="max-w-lg text-sm leading-6 text-zinc-500">
            Direction package, proposal copy, prompt, and execution advice are kept behind a calmer reading rhythm.
          </p>
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] 2xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)]">
          <div className="min-w-0">
            <section className="mb-3 rounded-[18px] border border-white/[0.06] bg-white/[0.018] px-4 py-5 md:px-5">
              <div className="grid gap-4 md:grid-cols-5 xl:grid-cols-4">
                <SummaryItem label="Project type" value={result.project_type} />
                <SummaryItem label="Output goal" value={result.output_goal} />
                <SummaryItem label="References" value={`${input.referenceImages.length}`} />
                <SummaryItem label="Style tags" value={result.style_tags.join(", ")} wide />
              </div>
              <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-7 text-zinc-600">{result.input_summary}</p>
            </section>

            {result.reference_image_summary.length > 0 ? (
              <CollapsibleSection
                title="Reference Notes"
                label="Reference"
                summary={`${result.reference_image_summary.length} images / ${result.reference_image_summary
                  .map((image) => image.file_name)
                  .slice(0, 2)
                  .join(", ")}`}
                defaultExpanded={false}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {result.reference_image_summary.map((image) => (
                    <div key={image.image_id} className="quiet-panel min-w-0 p-4">
                      <p className="truncate text-sm text-zinc-200">{image.file_name}</p>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        {image.observed_style} / {image.color_tone} / {image.composition_notes}
                      </p>
                      <p className="mt-2 text-xs text-cyan-100/70">{image.usable_elements.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            ) : null}

            <EditableSection<DirectionPackage>
          title="Direction Package"
          label="Visual package"
          summary={`${short(result.direction_package.core_concept)} / material, lighting, composition, do-not rules`}
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
          </div>

          <div className="min-w-0 xl:border-l xl:border-white/[0.07] xl:pl-6">
            <EditableSection<ProposalCopy>
          title="Proposal Copy"
          label="Proposal"
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
          label="Prompt"
          summary={`ZH / EN / ${short(result.prompt_package.zh?.main_prompt ?? result.prompt_package.main_prompt, 72)}`}
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
          label="Execution"
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
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ExportPanel result={result} onExport={onExport} />
      </div>

      <div className="sticky bottom-4 z-20 mt-8 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-[18px] border border-white/10 bg-[#090a0d]/86 p-2.5 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-md">
        <ActionButton onClick={() => copyText(formatDirectionMarkdown(result))}>Copy package</ActionButton>
        <ActionButton onClick={() => copyText(formatPromptMarkdown(result))}>Copy prompt</ActionButton>
        <ActionButton onClick={onSave}>{saved ? "Saved to Archive" : edited ? "Save edits to Archive" : "Save to Archive"}</ActionButton>
        <ActionButton onClick={onRegenerate}>Regenerate</ActionButton>
        <ActionButton onClick={onClear} muted>
          Clear input
        </ActionButton>
      </div>
    </section>
  );
}

function SummaryItem({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={["min-w-0 border-t border-white/10 pt-3", wide ? "md:col-span-2" : ""].join(" ")}>
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-1 break-words text-sm text-zinc-200">{value || "Not selected"}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  muted = false,
}: {
  children: ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-[12px] border px-3 py-2 text-xs transition",
        muted
          ? "border-white/10 bg-white/[0.025] text-zinc-400 hover:text-zinc-100"
          : "border-cyan-200/20 bg-cyan-300/[0.06] text-cyan-50 hover:bg-cyan-300/[0.1]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

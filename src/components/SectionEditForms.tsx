"use client";

import { useState } from "react";
import { ensureBilingualPromptPackage } from "@/lib/promptPackage";
import type {
  DirectionCandidate,
  DirectionPackage,
  ExecutionAdvice,
  PromptLanguagePackage,
  PromptPackage,
  ProposalCopy,
  RecommendedDirection,
} from "@/lib/types";

type EditProps<T> = {
  value: T;
  onCancel: () => void;
  onSave: (value: T) => void;
};

function listToText(items: string[]) {
  return items.join("\n");
}

function textToList(value: string) {
  return value
    .split(/\r?\n|,|，|、/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CandidateEditForm({ value, onCancel, onSave }: EditProps<DirectionCandidate>) {
  const [type, setType] = useState<string>(value.type);
  const [title, setTitle] = useState(value.title);
  const [concept, setConcept] = useState(value.one_line_concept);
  const [visualKeywords, setVisualKeywords] = useState(listToText(value.visual_keywords));
  const [moodKeywords, setMoodKeywords] = useState(listToText(value.mood_keywords));
  const [strength, setStrength] = useState(value.strength);
  const [risk, setRisk] = useState(value.risk);

  return (
    <EditFormFrame onCancel={onCancel} onSave={() => onSave({
      ...value,
      type: type as DirectionCandidate["type"],
      title,
      one_line_concept: concept,
      visual_keywords: textToList(visualKeywords),
      mood_keywords: textToList(moodKeywords),
      strength,
      risk,
    })}>
      <EditTextField label="类型" value={type} onChange={setType} />
      <EditTextField label="标题" value={title} onChange={setTitle} />
      <EditTextareaField label="一句话概念" value={concept} onChange={setConcept} rows={3} />
      <EditTextareaField label="视觉关键词（一行一个）" value={visualKeywords} onChange={setVisualKeywords} />
      <EditTextareaField label="情绪关键词（一行一个）" value={moodKeywords} onChange={setMoodKeywords} />
      <EditTextareaField label="优势" value={strength} onChange={setStrength} rows={3} />
      <EditTextareaField label="风险" value={risk} onChange={setRisk} rows={3} />
    </EditFormFrame>
  );
}

export function RecommendedEditForm({ value, onCancel, onSave }: EditProps<RecommendedDirection>) {
  const [title, setTitle] = useState(value.title);
  const [reason, setReason] = useState(value.reason);
  const [coreSentence, setCoreSentence] = useState(value.core_sentence);

  return (
    <EditFormFrame onCancel={onCancel} onSave={() => onSave({ ...value, title, reason, core_sentence: coreSentence })}>
      <EditTextField label="标题" value={title} onChange={setTitle} />
      <EditTextareaField label="核心方向句" value={coreSentence} onChange={setCoreSentence} rows={3} />
      <EditTextareaField label="推荐理由" value={reason} onChange={setReason} rows={5} />
    </EditFormFrame>
  );
}

export function DirectionPackageEditForm({ value, onCancel, onSave }: EditProps<DirectionPackage>) {
  const [coreConcept, setCoreConcept] = useState(value.core_concept);
  const [mood, setMood] = useState(listToText(value.mood));
  const [material, setMaterial] = useState(listToText(value.material));
  const [lighting, setLighting] = useState(listToText(value.lighting));
  const [composition, setComposition] = useState(listToText(value.composition));
  const [colorPalette, setColorPalette] = useState(listToText(value.color_palette));
  const [doNot, setDoNot] = useState(listToText(value.do_not));

  return (
    <EditFormFrame onCancel={onCancel} onSave={() => onSave({
      core_concept: coreConcept,
      mood: textToList(mood),
      material: textToList(material),
      lighting: textToList(lighting),
      composition: textToList(composition),
      color_palette: textToList(colorPalette),
      do_not: textToList(doNot),
    })}>
      <EditTextareaField label="核心概念" value={coreConcept} onChange={setCoreConcept} rows={4} />
      <EditTextareaField label="情绪关键词（一行一个）" value={mood} onChange={setMood} />
      <EditTextareaField label="材质语言（一行一个）" value={material} onChange={setMaterial} />
      <EditTextareaField label="光线方式（一行一个）" value={lighting} onChange={setLighting} />
      <EditTextareaField label="构图 / 镜头（一行一个）" value={composition} onChange={setComposition} />
      <EditTextareaField label="色彩方案（一行一个）" value={colorPalette} onChange={setColorPalette} />
      <EditTextareaField label="避免事项（一行一个）" value={doNot} onChange={setDoNot} />
    </EditFormFrame>
  );
}

export function ProposalCopyEditForm({ value, onCancel, onSave }: EditProps<ProposalCopy>) {
  const [shortPitch, setShortPitch] = useState(value.short_pitch);
  const [clientDescription, setClientDescription] = useState(value.client_facing_description);
  const [internalNote, setInternalNote] = useState(value.internal_direction_note);

  return (
    <EditFormFrame onCancel={onCancel} onSave={() => onSave({
      short_pitch: shortPitch,
      client_facing_description: clientDescription,
      internal_direction_note: internalNote,
    })}>
      <EditTextareaField label="短 Pitch" value={shortPitch} onChange={setShortPitch} rows={3} />
      <EditTextareaField label="客户可读描述" value={clientDescription} onChange={setClientDescription} rows={6} />
      <EditTextareaField label="内部执行备注" value={internalNote} onChange={setInternalNote} rows={5} />
    </EditFormFrame>
  );
}

export function PromptPackageEditForm({ value, onCancel, onSave }: EditProps<PromptPackage>) {
  const bilingual = ensureBilingualPromptPackage(value);
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const [zh, setZh] = useState(bilingual.zh);
  const [en, setEn] = useState(bilingual.en);
  const active = language === "zh" ? zh : en;
  const setActive = language === "zh" ? setZh : setEn;

  function patchActive(next: Partial<PromptLanguagePackage>) {
    setActive({ ...active, ...next });
  }

  return (
    <EditFormFrame onCancel={onCancel} onSave={() => onSave({
      ...value,
      main_prompt: zh.main_prompt,
      variation_prompts: zh.variation_prompts,
      negative_constraints: zh.negative_constraints,
      zh,
      en,
    })}>
      <div className="flex flex-wrap gap-2">
        <TabButton active={language === "zh"} onClick={() => setLanguage("zh")}>中文版</TabButton>
        <TabButton active={language === "en"} onClick={() => setLanguage("en")}>English Version</TabButton>
      </div>
      <EditTextareaField
        label={language === "zh" ? "主 Prompt" : "Main Prompt"}
        value={active.main_prompt}
        onChange={(main_prompt) => patchActive({ main_prompt })}
        rows={5}
      />
      <EditTextareaField
        label={language === "zh" ? "变体 Prompt（一行一个）" : "Variation Prompts, one per line"}
        value={listToText(active.variation_prompts)}
        onChange={(variationPrompts) => patchActive({ variation_prompts: textToList(variationPrompts) })}
        rows={5}
      />
      <EditTextareaField
        label={language === "zh" ? "Negative Constraints（一行一个）" : "Negative Constraints, one per line"}
        value={listToText(active.negative_constraints)}
        onChange={(negativeConstraints) => patchActive({ negative_constraints: textToList(negativeConstraints) })}
        rows={5}
      />
    </EditFormFrame>
  );
}

export function ExecutionAdviceEditForm({ value, onCancel, onSave }: EditProps<ExecutionAdvice>) {
  const [firstStep, setFirstStep] = useState(value.first_step);
  const [workflow, setWorkflow] = useState(value.recommended_workflow);
  const [riskWarning, setRiskWarning] = useState(value.risk_warning);

  return (
    <EditFormFrame onCancel={onCancel} onSave={() => onSave({
      first_step: firstStep,
      recommended_workflow: workflow,
      risk_warning: riskWarning,
    })}>
      <EditTextareaField label="第一步" value={firstStep} onChange={setFirstStep} rows={3} />
      <EditTextareaField label="推荐工作流" value={workflow} onChange={setWorkflow} rows={5} />
      <EditTextareaField label="风险提醒" value={riskWarning} onChange={setRiskWarning} rows={4} />
    </EditFormFrame>
  );
}

function EditFormFrame({
  children,
  onCancel,
  onSave,
}: {
  children: React.ReactNode;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 border border-cyan-200/15 bg-black/35 p-4">
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
        <button type="button" onClick={onCancel} className="border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:text-zinc-100">
          Cancel
        </button>
        <button type="button" onClick={onSave} className="border border-cyan-200/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50 transition hover:bg-cyan-300/15">
          Save
        </button>
      </div>
    </div>
  );
}

function EditTextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span className="text-xs text-zinc-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-200/30"
      />
    </label>
  );
}

function EditTextareaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 resize-y border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-200/30"
      />
    </label>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border px-3 py-2 text-xs transition",
        active ? "border-cyan-200/30 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/[0.03] text-zinc-500",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

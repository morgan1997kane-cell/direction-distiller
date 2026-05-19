import type {
  DirectionCandidate,
  DirectionInput,
  DirectionPackage,
  DirectionResult,
  DirectionScores,
  ExecutionAdvice,
  PromptPackage,
  ProposalCopy,
  RecommendedDirection,
  ReferenceImageSummary,
} from "@/lib/types";
import { normalizePromptPackage } from "@/lib/promptPackage";

const candidateTypes = ["稳妥型", "大胆型", "执行型"] as const;

type CandidateType = (typeof candidateTypes)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function pickRecord(record: Record<string, unknown>, keys: string[]) {
  const value = pick(record, keys);
  return isRecord(value) ? value : {};
}

function text(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function arrayOfText(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    const items = value.map((item) => text(item, "")).filter(Boolean);
    return items.length > 0 ? items : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    const items = value
      .split(/[、，,；;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length > 0 ? items : fallback;
  }

  return fallback;
}

function score(value: unknown, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export function normalizeScores(value: unknown, index = 0): DirectionScores {
  const record = isRecord(value) ? value : {};
  const base = [76, 82, 79][index] ?? 75;

  return {
    clarity: score(
      pick(record, ["clarity", "clear", "clarity_score", "clarityScore", "readability", "清晰度"]),
      base,
    ),
    visual_control: score(
      pick(record, [
        "visual_control",
        "visualControl",
        "visual_control_score",
        "visualControlScore",
        "controllability",
        "control",
        "control_score",
        "画面可控性",
        "可控性",
      ]),
      base - 2,
    ),
    proposal_value: score(
      pick(record, [
        "proposal_value",
        "proposalValue",
        "proposal_value_score",
        "proposalValueScore",
        "pitch_value",
        "communication_value",
        "commercial_value",
        "提案价值",
      ]),
      base + 2,
    ),
    execution_feasibility: score(
      pick(record, [
        "execution_feasibility",
        "executionFeasibility",
        "execution_feasibility_score",
        "executionFeasibilityScore",
        "execution",
        "feasibility",
        "production_feasibility",
        "执行可行性",
        "可行性",
      ]),
      base,
    ),
  };
}

function normalizeCandidateType(value: unknown, index: number): CandidateType {
  const raw = text(value, "").toLowerCase();
  if (raw.includes("稳") || raw.includes("safe") || raw.includes("client") || raw.includes("commercial")) return "稳妥型";
  if (raw.includes("大胆") || raw.includes("bold") || raw.includes("experimental") || raw.includes("memory")) return "大胆型";
  if (raw.includes("执行") || raw.includes("execution") || raw.includes("production") || raw.includes("feasible")) return "执行型";
  return candidateTypes[index] ?? "稳妥型";
}

function candidateFallback(type: CandidateType, index: number): DirectionCandidate {
  const titles: Record<CandidateType, string> = {
    稳妥型: "清晰稳妥的提案方向",
    大胆型: "更有记忆点的视觉方向",
    执行型: "可快速落地的执行方向",
  };

  return {
    id: `candidate-${index + 1}`,
    type,
    title: titles[type],
    one_line_concept: "将输入灵感压缩成一个可沟通、可评估、可继续探索的视觉方向。",
    visual_keywords: ["主视觉", "结构清晰", "提案感"],
    mood_keywords: ["克制", "专业", "清晰"],
    strength: "便于进入提案沟通，并保留后续视觉探索空间。",
    risk: "需要在首轮视觉测试中继续确认画面记忆点与执行边界。",
    scores: normalizeScores(undefined, index),
  };
}

export function normalizeCandidate(value: unknown, forcedType?: CandidateType, index = 0): DirectionCandidate {
  const record = isRecord(value) ? value : {};
  const type = forcedType ?? normalizeCandidateType(pick(record, ["type", "kind", "category", "route", "策略类型", "类型"]), index);
  const fallback = candidateFallback(type, index);
  const rawScores = pick(record, ["scores", "score", "rating", "ratings", "评分"]);

  return {
    id: text(pick(record, ["id", "candidate_id", "candidateId", "key", "候选id"]), fallback.id),
    type,
    title: text(pick(record, ["title", "name", "direction_name", "directionName", "headline", "方案名", "方向名称", "标题"]), fallback.title),
    one_line_concept: text(
      pick(record, [
        "one_line_concept",
        "oneLineConcept",
        "concept",
        "core_concept",
        "coreConcept",
        "description",
        "summary",
        "big_idea",
        "bigIdea",
        "一句话概念",
        "概念",
      ]),
      fallback.one_line_concept,
    ),
    visual_keywords: arrayOfText(
      pick(record, [
        "visual_keywords",
        "visualKeywords",
        "visual_keys",
        "key_visuals",
        "key_elements",
        "keyElements",
        "visual_elements",
        "elements",
        "keywords",
        "视觉关键词",
        "画面关键词",
      ]),
      fallback.visual_keywords,
    ),
    mood_keywords: arrayOfText(
      pick(record, ["mood_keywords", "moodKeywords", "mood", "tone", "atmosphere", "emotion", "情绪关键词", "氛围关键词"]),
      fallback.mood_keywords,
    ),
    strength: text(pick(record, ["strength", "advantage", "benefit", "value", "why_it_works", "优势", "亮点"]), fallback.strength),
    risk: text(pick(record, ["risk", "weakness", "watchout", "tradeoff", "caution", "风险", "注意点"]), fallback.risk),
    scores: normalizeScores(isRecord(rawScores) ? rawScores : record, index),
  };
}

function normalizeCandidates(value: unknown): DirectionCandidate[] {
  const source = Array.isArray(value) ? value : [];

  return candidateTypes.map((type, index) => {
    const typed = source.find((item) => {
      if (!isRecord(item)) return false;
      return normalizeCandidateType(pick(item, ["type", "kind", "category", "route", "策略类型", "类型"]), index) === type;
    });
    return normalizeCandidate(typed ?? source[index], type, index);
  });
}

function normalizeReferenceSummary(value: unknown, input: DirectionInput): ReferenceImageSummary[] {
  const source = Array.isArray(value) ? value : [];

  if (input.referenceImages.length === 0 && source.length === 0) return [];

  return (input.referenceImages.length > 0 ? input.referenceImages : source).map((image, index) => {
    const record = isRecord(source[index]) ? source[index] : {};
    const inputImage = isRecord(image) ? image : undefined;

    return {
      image_id: text(pick(record, ["image_id", "imageId", "id"]), inputImage?.id ? String(inputImage.id) : `reference-${index + 1}`),
      file_name: text(
        pick(record, ["file_name", "fileName", "filename", "name", "文件名"]),
        inputImage?.fileName ? String(inputImage.fileName) : `reference-${index + 1}`,
      ),
      observed_style: text(pick(record, ["observed_style", "observedStyle", "style", "visual_style", "观察风格"]), "仅基于文件名与项目上下文生成参考摘要"),
      color_tone: text(pick(record, ["color_tone", "colorTone", "tone", "palette", "色调"]), "待首轮视觉测试确认"),
      composition_notes: text(pick(record, ["composition_notes", "compositionNotes", "composition", "layout", "构图备注"]), "未进行真实图片识别，仅作文本参考"),
      usable_elements: arrayOfText(pick(record, ["usable_elements", "usableElements", "elements", "signals", "可用元素"]), [
        "文件名线索",
        "项目语境",
      ]),
    };
  });
}

export function normalizeRecommendedDirection(
  value: unknown,
  candidates: DirectionCandidate[],
): RecommendedDirection {
  const record = isRecord(value) ? value : {};
  const recommendedId = text(
    pick(record, ["candidate_id", "candidateId", "selected_candidate_id", "selectedCandidateId", "id", "推荐候选id"]),
    candidates[0]?.id ?? "candidate-1",
  );
  const recommended = candidates.find((candidate) => candidate.id === recommendedId) ?? candidates[0];

  return {
    candidate_id: recommended?.id ?? "candidate-1",
    title: text(pick(record, ["title", "name", "headline", "recommendation_title", "标题"]), recommended?.title ?? "推荐方向"),
    reason: text(
      pick(record, ["reason", "why", "rationale", "recommendation_reason", "selection_reason", "推荐理由"]),
      "该方向在清晰度、提案价值与执行可行性之间相对平衡。",
    ),
    core_sentence: text(
      pick(record, ["core_sentence", "coreSentence", "summary", "concept", "one_line_concept", "核心句"]),
      recommended?.one_line_concept ?? "以当前输入为基础形成可提案、可执行的视觉方向。",
    ),
  };
}

export function normalizeDirectionPackageSection(value: unknown, fallbackCandidate?: DirectionCandidate): DirectionPackage {
  const record = isRecord(value) ? value : {};

  return {
    core_concept: text(
      pick(record, ["core_concept", "coreConcept", "concept", "strategy", "visual_strategy", "big_idea", "核心概念"]),
      fallbackCandidate?.one_line_concept ?? "以一个清晰主视觉策略统合材料、光线、构图与情绪。",
    ),
    mood: arrayOfText(pick(record, ["mood", "moods", "emotion", "tone", "atmosphere", "情绪"]), fallbackCandidate?.mood_keywords ?? ["克制", "专业", "清晰"]),
    material: arrayOfText(
      pick(record, ["material", "materials", "material_language", "textures", "surfaces", "材质"]),
      ["克制质感", "清晰主体", "可控细节"],
    ),
    lighting: arrayOfText(
      pick(record, ["lighting", "light", "lighting_language", "light_strategy", "光线"]),
      ["柔和主光", "边缘轮廓光", "低对比环境光"],
    ),
    composition: arrayOfText(
      pick(record, ["composition", "layout", "framing", "camera", "shot_language", "构图"]),
      ["主体清晰", "层级明确", "留白控制"],
    ),
    color_palette: arrayOfText(
      pick(record, ["color_palette", "colorPalette", "color", "colors", "palette", "color_strategy", "色彩"]),
      ["高级灰", "低饱和冷色", "局部亮色点缀"],
    ),
    do_not: arrayOfText(
      pick(record, ["do_not", "doNot", "avoid", "avoid_rules", "negative", "constraints", "禁忌", "避免"]),
      ["不要堆砌所有参考元素", "避免主视觉层级失焦"],
    ),
  };
}

export function normalizeProposalCopySection(value: unknown, fallbackTitle = "推荐方向"): ProposalCopy {
  const record = isRecord(value) ? value : {};

  return {
    short_pitch: text(pick(record, ["short_pitch", "shortPitch", "pitch", "headline", "title", "slogan", "短pitch"]), fallbackTitle),
    client_facing_description: text(
      pick(record, ["client_facing_description", "clientFacingDescription", "client_copy", "clientCopy", "description", "客户描述"]),
      "这套方向将零散灵感整理为可提案、可讨论、可延展的视觉系统。",
    ),
    internal_direction_note: text(
      pick(record, ["internal_direction_note", "internalDirectionNote", "internal_note", "internalNote", "production_note", "内部备注"]),
      "首轮先验证色调、构图和主体记忆点，再推进材质与执行细化。",
    ),
  };
}

export function normalizePromptPackageSection(value: unknown, fallbackTitle = "visual direction"): PromptPackage {
  const record = isRecord(value) ? value : {};
  const zh = pick(record, ["zh", "cn", "chinese", "zh_cn", "zhCN", "中文"]);
  const en = pick(record, ["en", "english", "en_us", "enUS", "英文"]);

  return normalizePromptPackage({
    main_prompt: text(
      pick(record, ["main_prompt", "mainPrompt", "prompt", "positive_prompt", "positivePrompt", "主prompt"]),
      `${fallbackTitle}, visual direction, proposal-ready`,
    ),
    variation_prompts: arrayOfText(pick(record, ["variation_prompts", "variationPrompts", "variations", "variants", "变体prompt"]), [
      `${fallbackTitle}, restrained composition`,
      `${fallbackTitle}, stronger visual memory point`,
      `${fallbackTitle}, production-ready exploration`,
    ]),
    negative_constraints: arrayOfText(
      pick(record, ["negative_constraints", "negativeConstraints", "negative_prompt", "negativePrompt", "avoid", "反向约束"]),
      ["avoid chaotic collage", "avoid unclear subject hierarchy", "avoid cheap glow"],
    ),
    zh: isRecord(zh) ? (zh as unknown as PromptPackage["zh"]) : undefined,
    en: isRecord(en) ? (en as unknown as PromptPackage["en"]) : undefined,
  });
}

export function normalizeExecutionAdviceSection(value: unknown): ExecutionAdvice {
  const record = isRecord(value) ? value : {};

  return {
    first_step: text(pick(record, ["first_step", "firstStep", "first", "next_step", "nextStep", "第一步"]), "先用 6-9 张静帧验证方向是否成立。"),
    recommended_workflow: text(
      pick(record, ["recommended_workflow", "recommendedWorkflow", "workflow", "process", "action_plan", "推荐流程"]),
      "先确认色调、构图和主体关系，再进入材质、光线与动态方案细化。",
    ),
    risk_warning: text(
      pick(record, ["risk_warning", "riskWarning", "risk", "warning", "caution", "风险提醒"]),
      "避免同时堆叠过多风格标签，导致画面主次不清。",
    ),
  };
}

export function normalizeProviderDirectionResult(raw: unknown, input: DirectionInput): DirectionResult | null {
  if (!isRecord(raw)) return null;

  const resultRecord = pickRecord(raw, ["result", "data", "output", "direction_result", "directionResult"]);
  const source = Object.keys(resultRecord).length > 0 ? resultRecord : raw;

  const candidates = normalizeCandidates(
    pick(source, [
      "candidate_directions",
      "candidateDirections",
      "candidates",
      "directions",
      "direction_candidates",
      "directionCandidates",
      "visual_directions",
      "visualDirections",
      "routes",
      "options",
      "concepts",
      "候选方向",
      "方向候选",
      "视觉方向",
    ]),
  );
  const recommended = normalizeRecommendedDirection(
    pick(source, [
      "recommended_direction",
      "recommendedDirection",
      "recommendation",
      "recommended",
      "selected_direction",
      "selectedDirection",
      "final_recommendation",
      "finalRecommendation",
      "main_direction",
      "mainDirection",
      "推荐方向",
      "推荐方案",
    ]),
    candidates,
  );
  const recommendedCandidate = candidates.find((candidate) => candidate.id === recommended.candidate_id) ?? candidates[0];

  return {
    id: text(pick(source, ["id", "result_id", "resultId"]), `result-${Date.now()}`),
    createdAt: text(pick(source, ["createdAt", "created_at", "created"]), new Date().toISOString()),
    project_type: input.projectType,
    output_goal: input.outputGoal,
    input_summary: text(
      pick(source, ["input_summary", "inputSummary", "summary", "brief_summary", "briefSummary", "输入摘要"]),
      input.brief || "用户主要通过参考图建立方向。",
    ),
    reference_image_summary: normalizeReferenceSummary(
      pick(source, ["reference_image_summary", "referenceImageSummary", "referenceImages", "reference_summary", "references", "参考图摘要"]),
      input,
    ),
    style_tags: input.styleTags,
    candidate_directions: candidates,
    recommended_direction: recommended,
    direction_package: normalizeDirectionPackageSection(
      pick(source, [
        "direction_package",
        "directionPackage",
        "visual_system",
        "visualSystem",
        "visual_language",
        "visualLanguage",
        "package",
        "direction",
        "system",
        "方向包",
        "视觉系统",
        "视觉方向包",
      ]),
      recommendedCandidate,
    ),
    proposal_copy: normalizeProposalCopySection(
      pick(source, [
        "proposal_copy",
        "proposalCopy",
        "proposal",
        "proposal_text",
        "proposalText",
        "copy",
        "copywriting",
        "pitch",
        "presentation_copy",
        "提案文案",
      ]),
      recommended.title,
    ),
    prompt_package: normalizePromptPackageSection(
      pick(source, ["prompt_package", "promptPackage", "prompts", "prompt", "prompt_draft", "promptDraft", "image_prompts", "imagePrompts", "Prompt包"]),
      recommended.title,
    ),
    execution_advice: normalizeExecutionAdviceSection(
      pick(source, ["execution_advice", "executionAdvice", "advice", "next_steps", "nextSteps", "action_plan", "workflow", "执行建议", "下一步"]),
    ),
  };
}

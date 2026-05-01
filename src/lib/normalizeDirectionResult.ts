import type {
  DirectionCandidate,
  DirectionInput,
  DirectionResult,
  DirectionScores,
  ReferenceImageSummary,
} from "@/lib/types";
import { normalizePromptPackage } from "@/lib/promptPackage";

const candidateTypes = ["稳妥型", "大胆型", "执行型"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pick(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
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
    return value
      .split(/[、,，;；\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function score(value: unknown, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeScores(value: unknown, index: number): DirectionScores {
  const record = isRecord(value) ? value : {};
  const base = [76, 82, 79][index] ?? 75;

  return {
    clarity: score(pick(record, ["clarity", "清晰度"]), base),
    visual_control: score(pick(record, ["visual_control", "visualControl", "controllability", "control", "画面可控性", "可控性"]), base - 2),
    proposal_value: score(pick(record, ["proposal_value", "proposalValue", "提案价值"]), base + 2),
    execution_feasibility: score(
      pick(record, ["execution_feasibility", "executionFeasibility", "执行可行性", "可行性"]),
      base,
    ),
  };
}

function candidateFallback(type: (typeof candidateTypes)[number], index: number): DirectionCandidate {
  const titles = {
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

function normalizeCandidate(value: unknown, type: (typeof candidateTypes)[number], index: number): DirectionCandidate {
  const fallback = candidateFallback(type, index);
  const record = isRecord(value) ? value : {};

  return {
    id: text(pick(record, ["id", "candidate_id", "候选id"]), fallback.id),
    type,
    title: text(pick(record, ["title", "name", "方向名称", "标题"]), fallback.title),
    one_line_concept: text(
      pick(record, ["one_line_concept", "oneLineConcept", "concept", "description", "core_concept", "coreConcept", "一句话概念", "概念"]),
      fallback.one_line_concept,
    ),
    visual_keywords: arrayOfText(
      pick(record, ["visual_keywords", "visualKeywords", "key_elements", "keyElements", "elements", "visual_elements", "视觉关键词", "画面关键词"]),
      fallback.visual_keywords,
    ),
    mood_keywords: arrayOfText(
      pick(record, ["mood_keywords", "moodKeywords", "mood", "tone", "atmosphere", "情绪关键词", "氛围关键词"]),
      fallback.mood_keywords,
    ),
    strength: text(pick(record, ["strength", "优势", "亮点"]), fallback.strength),
    risk: text(pick(record, ["risk", "风险", "注意点"]), fallback.risk),
    scores: normalizeScores(pick(record, ["scores", "评分"]), index),
  };
}

function normalizeCandidates(value: unknown): DirectionCandidate[] {
  const source = Array.isArray(value) ? value : [];

  return candidateTypes.map((type, index) => {
    const typed = source.find((item) => isRecord(item) && text(pick(item, ["type", "类型"]), "").includes(type));
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
        pick(record, ["file_name", "fileName", "文件名"]),
        inputImage?.fileName ? String(inputImage.fileName) : `reference-${index + 1}`,
      ),
      observed_style: text(pick(record, ["observed_style", "observedStyle", "style", "观察风格"]), "仅基于文件名与项目上下文生成参考摘要"),
      color_tone: text(pick(record, ["color_tone", "colorTone", "色调"]), "待首轮视觉测试确认"),
      composition_notes: text(pick(record, ["composition_notes", "compositionNotes", "构图备注"]), "未进行真实图片识别，仅作文本参考"),
      usable_elements: arrayOfText(pick(record, ["usable_elements", "usableElements", "可用元素"]), [
        "文件名线索",
        "项目语境",
      ]),
    };
  });
}

function section(record: Record<string, unknown>, keys: string[]) {
  const value = pick(record, keys);
  return isRecord(value) ? value : {};
}

export function normalizeProviderDirectionResult(raw: unknown, input: DirectionInput): DirectionResult | null {
  if (!isRecord(raw)) return null;

  const candidates = normalizeCandidates(pick(raw, ["candidate_directions", "candidates", "候选方向"]));
  const directionPackage = section(raw, ["direction_package", "package", "directionPackage", "方向包"]);
  const proposalCopy = section(raw, ["proposal_copy", "proposal", "copy", "pitch", "proposalCopy", "提案文案"]);
  const promptPackage = section(raw, ["prompt_package", "prompts", "prompt", "prompt_draft", "promptPackage", "Prompt包"]);
  const advice = section(raw, ["execution_advice", "advice", "executionAdvice", "执行建议"]);
  const recommendation = section(raw, ["recommended_direction", "recommendation", "recommendedDirection", "推荐方向"]);
  const recommendedId = text(pick(recommendation, ["candidate_id", "candidateId", "id"]), candidates[0].id);
  const recommended = candidates.find((candidate) => candidate.id === recommendedId) ?? candidates[0];

  return {
    id: text(pick(raw, ["id"]), `result-${Date.now()}`),
    createdAt: text(pick(raw, ["createdAt", "created_at"]), new Date().toISOString()),
    project_type: input.projectType,
    output_goal: input.outputGoal,
    input_summary: text(pick(raw, ["input_summary", "summary", "输入摘要"]), input.brief || "用户主要通过参考图建立方向。"),
    reference_image_summary: normalizeReferenceSummary(
      pick(raw, ["reference_image_summary", "referenceImages", "reference_summary", "参考图摘要"]),
      input,
    ),
    style_tags: input.styleTags,
    candidate_directions: candidates,
    recommended_direction: {
      candidate_id: recommended.id,
      title: text(pick(recommendation, ["title", "标题"]), recommended.title),
      reason: text(pick(recommendation, ["reason", "推荐理由"]), "该方向在清晰度、提案价值与执行可行性之间相对平衡。"),
      core_sentence: text(
        pick(recommendation, ["core_sentence", "coreSentence", "核心句"]),
        recommended.one_line_concept,
      ),
    },
    direction_package: {
      core_concept: text(pick(directionPackage, ["core_concept", "coreConcept", "核心概念"]), recommended.one_line_concept),
      mood: arrayOfText(pick(directionPackage, ["mood", "情绪"]), recommended.mood_keywords),
      material: arrayOfText(pick(directionPackage, ["material", "materials", "材质"]), ["克制质感", "清晰主体", "可控细节"]),
      lighting: arrayOfText(pick(directionPackage, ["lighting", "光线"]), ["柔和主光", "边缘轮廓光", "低对比环境光"]),
      composition: arrayOfText(pick(directionPackage, ["composition", "构图"]), ["主体清晰", "层级明确", "留白控制"]),
      color_palette: arrayOfText(pick(directionPackage, ["color_palette", "colorPalette", "色彩"]), ["高级灰", "低饱和冷色", "局部亮色点缀"]),
      do_not: arrayOfText(pick(directionPackage, ["do_not", "doNot", "avoid", "避免"]), ["不要堆砌所有参考元素", "避免主视觉层级失焦"]),
    },
    proposal_copy: {
      short_pitch: text(pick(proposalCopy, ["short_pitch", "shortPitch", "pitch", "headline", "title", "短pitch"]), recommended.title),
      client_facing_description: text(
        pick(proposalCopy, ["client_facing_description", "clientFacingDescription", "客户描述"]),
        "这套方向将零散灵感整理为可提案、可讨论、可延展的视觉系统。",
      ),
      internal_direction_note: text(
        pick(proposalCopy, ["internal_direction_note", "internalDirectionNote", "内部备注"]),
        "首轮先验证色调、构图和主体记忆点，再推进材质与执行细化。",
      ),
    },
    prompt_package: normalizePromptPackage({
      main_prompt: text(pick(promptPackage, ["main_prompt", "mainPrompt", "主prompt"]), `${recommended.title}, visual direction, proposal-ready`),
      variation_prompts: arrayOfText(pick(promptPackage, ["variation_prompts", "variationPrompts", "变化prompt"]), [
        `${recommended.title}, restrained composition`,
        `${recommended.title}, stronger visual memory point`,
      ]),
      negative_constraints: arrayOfText(pick(promptPackage, ["negative_constraints", "negativeConstraints", "反向约束"]), [
        "avoid chaotic collage",
        "avoid unclear subject hierarchy",
      ]),
      zh: isRecord(promptPackage.zh) ? (promptPackage.zh as never) : undefined,
      en: isRecord(promptPackage.en) ? (promptPackage.en as never) : undefined,
    }),
    execution_advice: {
      first_step: text(pick(advice, ["first_step", "firstStep", "第一步"]), "先用 6-9 张静帧验证方向是否成立。"),
      recommended_workflow: text(
        pick(advice, ["recommended_workflow", "recommendedWorkflow", "推荐流程"]),
        "先确认色调、构图和主体关系，再进入材质、光线与动态方案细化。",
      ),
      risk_warning: text(pick(advice, ["risk_warning", "riskWarning", "风险提醒"]), "避免同时堆叠过多风格标签，导致画面主次不清。"),
    },
  };
}

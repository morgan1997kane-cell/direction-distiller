import type { DirectionInput, DirectionResult } from "@/lib/types";
import { normalizePromptPackage } from "@/lib/promptPackage";

const candidateTypes = ["稳妥型", "大胆型", "执行型"] as const;

const stringArraySchema = {
  type: "array",
  items: { type: "string" },
};

const scoresSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    clarity: { type: "integer" },
    visual_control: { type: "integer" },
    proposal_value: { type: "integer" },
    execution_feasibility: { type: "integer" },
  },
  required: ["clarity", "visual_control", "proposal_value", "execution_feasibility"],
};

const promptLanguagePackageSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    main_prompt: { type: "string" },
    variation_prompts: stringArraySchema,
    negative_constraints: stringArraySchema,
  },
  required: ["main_prompt", "variation_prompts", "negative_constraints"],
};

export const directionResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    createdAt: { type: "string" },
    project_type: { type: "string" },
    output_goal: { type: "string" },
    input_summary: { type: "string" },
    style_tags: stringArraySchema,
    reference_image_summary: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          image_id: { type: "string" },
          file_name: { type: "string" },
          observed_style: { type: "string" },
          color_tone: { type: "string" },
          composition_notes: { type: "string" },
          usable_elements: stringArraySchema,
        },
        required: [
          "image_id",
          "file_name",
          "observed_style",
          "color_tone",
          "composition_notes",
          "usable_elements",
        ],
      },
    },
    candidate_directions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: [...candidateTypes] },
          title: { type: "string" },
          one_line_concept: { type: "string" },
          visual_keywords: stringArraySchema,
          mood_keywords: stringArraySchema,
          strength: { type: "string" },
          risk: { type: "string" },
          scores: scoresSchema,
        },
        required: [
          "id",
          "type",
          "title",
          "one_line_concept",
          "visual_keywords",
          "mood_keywords",
          "strength",
          "risk",
          "scores",
        ],
      },
    },
    recommended_direction: {
      type: "object",
      additionalProperties: false,
      properties: {
        candidate_id: { type: "string" },
        title: { type: "string" },
        reason: { type: "string" },
        core_sentence: { type: "string" },
      },
      required: ["candidate_id", "title", "reason", "core_sentence"],
    },
    direction_package: {
      type: "object",
      additionalProperties: false,
      properties: {
        core_concept: { type: "string" },
        mood: stringArraySchema,
        material: stringArraySchema,
        lighting: stringArraySchema,
        composition: stringArraySchema,
        color_palette: stringArraySchema,
        do_not: stringArraySchema,
      },
      required: ["core_concept", "mood", "material", "lighting", "composition", "color_palette", "do_not"],
    },
    proposal_copy: {
      type: "object",
      additionalProperties: false,
      properties: {
        short_pitch: { type: "string" },
        client_facing_description: { type: "string" },
        internal_direction_note: { type: "string" },
      },
      required: ["short_pitch", "client_facing_description", "internal_direction_note"],
    },
    prompt_package: {
      type: "object",
      additionalProperties: false,
      properties: {
        main_prompt: { type: "string" },
        variation_prompts: stringArraySchema,
        negative_constraints: stringArraySchema,
        zh: promptLanguagePackageSchema,
        en: promptLanguagePackageSchema,
      },
      required: ["main_prompt", "variation_prompts", "negative_constraints"],
    },
    execution_advice: {
      type: "object",
      additionalProperties: false,
      properties: {
        first_step: { type: "string" },
        recommended_workflow: { type: "string" },
        risk_warning: { type: "string" },
      },
      required: ["first_step", "recommended_workflow", "risk_warning"],
    },
  },
  required: [
    "id",
    "createdAt",
    "project_type",
    "output_goal",
    "input_summary",
    "style_tags",
    "reference_image_summary",
    "candidate_directions",
    "recommended_direction",
    "direction_package",
    "proposal_copy",
    "prompt_package",
    "execution_advice",
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isScore(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
}

function hasString(record: Record<string, unknown>, key: string) {
  return typeof record[key] === "string" && String(record[key]).trim().length > 0;
}

function describePromptLanguageIssues(value: unknown, prefix: string) {
  const issues: string[] = [];
  if (!isRecord(value)) return [`missing ${prefix}`];
  if (!hasString(value, "main_prompt")) issues.push(`missing ${prefix}.main_prompt`);
  if (!isStringArray(value.variation_prompts)) issues.push(`missing ${prefix}.variation_prompts`);
  if (!isStringArray(value.negative_constraints)) issues.push(`missing ${prefix}.negative_constraints`);
  return issues;
}

export function describeDirectionResultIssues(value: unknown): string[] {
  const issues: string[] = [];

  if (!isRecord(value)) return ["result is not an object"];

  for (const key of ["id", "createdAt", "project_type", "output_goal", "input_summary"]) {
    if (!hasString(value, key)) issues.push(`missing ${key}`);
  }

  if (!isStringArray(value.style_tags)) issues.push("missing style_tags");
  if (!Array.isArray(value.reference_image_summary)) issues.push("missing reference_image_summary");

  if (!Array.isArray(value.candidate_directions)) {
    issues.push("missing candidate_directions");
  } else {
    if (value.candidate_directions.length !== 3) issues.push("candidate_directions length invalid");
    const seenTypes = new Set<string>();
    const candidateIds = new Set<string>();

    value.candidate_directions.forEach((item, index) => {
      const prefix = `candidate_directions[${index}]`;
      if (!isRecord(item)) {
        issues.push(`${prefix} is not an object`);
        return;
      }

      if (!candidateTypes.includes(item.type as (typeof candidateTypes)[number])) {
        issues.push(`${prefix}.type invalid`);
      } else {
        seenTypes.add(String(item.type));
      }

      if (hasString(item, "id")) candidateIds.add(String(item.id));
      for (const key of ["id", "title", "one_line_concept", "strength", "risk"]) {
        if (!hasString(item, key)) issues.push(`missing ${prefix}.${key}`);
      }
      if (!isStringArray(item.visual_keywords)) issues.push(`missing ${prefix}.visual_keywords`);
      if (!isStringArray(item.mood_keywords)) issues.push(`missing ${prefix}.mood_keywords`);
      if (!isRecord(item.scores)) {
        issues.push(`missing ${prefix}.scores`);
      } else {
        for (const key of ["clarity", "visual_control", "proposal_value", "execution_feasibility"]) {
          if (!isScore(item.scores[key])) issues.push(`missing ${prefix}.scores.${key}`);
        }
      }
    });

    for (const type of candidateTypes) {
      if (!seenTypes.has(type)) issues.push(`missing candidate type ${type}`);
    }

    const recommended = value.recommended_direction;
    if (!isRecord(recommended)) {
      issues.push("missing recommended_direction");
    } else {
      for (const key of ["candidate_id", "title", "reason", "core_sentence"]) {
        if (!hasString(recommended, key)) issues.push(`missing recommended_direction.${key}`);
      }
      if (hasString(recommended, "candidate_id") && !candidateIds.has(String(recommended.candidate_id))) {
        issues.push("recommended_direction candidate_id invalid");
      }
    }
  }

  const directionPackage = value.direction_package;
  if (!isRecord(directionPackage)) {
    issues.push("missing direction_package");
  } else {
    if (!hasString(directionPackage, "core_concept")) issues.push("missing direction_package.core_concept");
    for (const key of ["mood", "material", "lighting", "composition", "color_palette", "do_not"]) {
      if (!isStringArray(directionPackage[key])) issues.push(`missing direction_package.${key}`);
    }
  }

  const proposalCopy = value.proposal_copy;
  if (!isRecord(proposalCopy)) {
    issues.push("missing proposal_copy");
  } else {
    for (const key of ["short_pitch", "client_facing_description", "internal_direction_note"]) {
      if (!hasString(proposalCopy, key)) issues.push(`missing proposal_copy.${key}`);
    }
  }

  const promptPackage = value.prompt_package;
  if (!isRecord(promptPackage)) {
    issues.push("missing prompt_package");
  } else {
    if (!hasString(promptPackage, "main_prompt")) issues.push("missing prompt_package.main_prompt");
    if (!isStringArray(promptPackage.variation_prompts)) issues.push("missing prompt_package.variation_prompts");
    if (!isStringArray(promptPackage.negative_constraints)) issues.push("missing prompt_package.negative_constraints");
    issues.push(...describePromptLanguageIssues(promptPackage.zh, "prompt_package.zh"));
    issues.push(...describePromptLanguageIssues(promptPackage.en, "prompt_package.en"));
  }

  const advice = value.execution_advice;
  if (!isRecord(advice)) {
    issues.push("missing execution_advice");
  } else {
    for (const key of ["first_step", "recommended_workflow", "risk_warning"]) {
      if (!hasString(advice, key)) issues.push(`missing execution_advice.${key}`);
    }
  }

  return issues;
}

export function validateDirectionResult(value: unknown): value is DirectionResult {
  if (!isRecord(value)) return false;

  const stringKeys = ["id", "createdAt", "project_type", "output_goal", "input_summary"];
  if (!stringKeys.every((key) => hasString(value, key))) return false;
  if (!isStringArray(value.style_tags)) return false;

  if (!Array.isArray(value.reference_image_summary)) return false;
  const referencesValid = value.reference_image_summary.every((item) => {
    if (!isRecord(item)) return false;
    return (
      ["image_id", "file_name", "observed_style", "color_tone", "composition_notes"].every((key) =>
        hasString(item, key),
      ) && isStringArray(item.usable_elements)
    );
  });
  if (!referencesValid) return false;

  if (!Array.isArray(value.candidate_directions) || value.candidate_directions.length !== 3) return false;

  const seenTypes = new Set<string>();
  const candidateIds = new Set<string>();
  const candidatesValid = value.candidate_directions.every((item) => {
    if (!isRecord(item) || !isRecord(item.scores)) return false;
    if (!candidateTypes.includes(item.type as (typeof candidateTypes)[number])) return false;
    seenTypes.add(String(item.type));
    candidateIds.add(String(item.id));
    return (
      ["id", "title", "one_line_concept", "strength", "risk"].every((key) => hasString(item, key)) &&
      isStringArray(item.visual_keywords) &&
      isStringArray(item.mood_keywords) &&
      isScore(item.scores.clarity) &&
      isScore(item.scores.visual_control) &&
      isScore(item.scores.proposal_value) &&
      isScore(item.scores.execution_feasibility)
    );
  });
  if (!candidatesValid || candidateTypes.some((type) => !seenTypes.has(type))) return false;

  const recommended = value.recommended_direction;
  if (!isRecord(recommended)) return false;
  if (!["candidate_id", "title", "reason", "core_sentence"].every((key) => hasString(recommended, key))) {
    return false;
  }
  if (!candidateIds.has(String(recommended.candidate_id))) return false;

  const arraySections = [
    ["direction_package", ["mood", "material", "lighting", "composition", "color_palette", "do_not"]],
    ["prompt_package", ["variation_prompts", "negative_constraints"]],
  ] as const;
  for (const [sectionKey, arrayKeys] of arraySections) {
    const section = value[sectionKey];
    if (!isRecord(section)) return false;
    if (!arrayKeys.every((key) => isStringArray(section[key]))) return false;
  }

  const directionPackage = value.direction_package;
  if (!isRecord(directionPackage) || !hasString(directionPackage, "core_concept")) return false;

  const proposalCopy = value.proposal_copy;
  if (!isRecord(proposalCopy)) return false;
  if (!["short_pitch", "client_facing_description", "internal_direction_note"].every((key) => hasString(proposalCopy, key))) {
    return false;
  }

  const promptPackage = value.prompt_package;
  if (!isRecord(promptPackage) || !hasString(promptPackage, "main_prompt")) return false;

  const advice = value.execution_advice;
  if (!isRecord(advice)) return false;
  return ["first_step", "recommended_workflow", "risk_warning"].every((key) => hasString(advice, key));
}

export function normalizeDirectionResult(
  result: DirectionResult,
  input: DirectionInput,
  mode: "live" | "demo",
  provider?: string,
  model?: string,
): DirectionResult {
  return {
    ...result,
    id: result.id || `result-${Date.now()}`,
    createdAt: result.createdAt || new Date().toISOString(),
    ai_mode: mode,
    ai_provider: provider ?? result.ai_provider,
    ai_model: model ?? result.ai_model,
    project_type: input.projectType,
    output_goal: input.outputGoal,
    style_tags: input.styleTags.length > 0 ? input.styleTags : result.style_tags,
    prompt_package: normalizePromptPackage(result.prompt_package),
  };
}

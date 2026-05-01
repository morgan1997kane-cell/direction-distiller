import type { PromptLanguagePackage, PromptPackage } from "@/lib/types";

const DEFAULT_ZH_PROMPT: PromptLanguagePackage = {
  main_prompt:
    "以当前视觉方向为基础，生成一张可用于提案的主视觉探索图，强调主体层级、材质细节、光线控制与构图秩序。",
  variation_prompts: [
    "更商业稳妥的主视觉版本，适合客户首轮沟通",
    "更有记忆点的实验版本，强化传播感和视觉冲击",
    "更容易落地制作的执行版本，明确材质、光线和构图控制",
  ],
  negative_constraints: ["避免主体不清", "避免廉价霓虹", "避免杂乱拼贴", "避免过度风格化"],
};

const DEFAULT_EN_PROMPT: PromptLanguagePackage = {
  main_prompt:
    "proposal-ready key visual, clear subject hierarchy, controlled material detail, cinematic lighting, refined composition",
  variation_prompts: [
    "client-safe key visual with restrained premium composition",
    "bolder campaign visual with a stronger memory point",
    "production-ready visual test with clear material and lighting control",
  ],
  negative_constraints: ["avoid chaotic collage", "avoid unclear subject hierarchy", "avoid cheap glow", "avoid messy typography"],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function list(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => text(item, ""))
      .filter(Boolean);
    return items.length > 0 ? items : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    const items = value
      .split(/[\n,，、;；]/)
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length > 0 ? items : fallback;
  }

  return fallback;
}

function readFlatPromptPackage(value: unknown, fallback: PromptLanguagePackage): PromptLanguagePackage {
  const record = isRecord(value) ? value : {};

  return {
    main_prompt: text(record.main_prompt ?? record.mainPrompt ?? record.prompt, fallback.main_prompt),
    variation_prompts: list(
      record.variation_prompts ?? record.variationPrompts ?? record.variations,
      fallback.variation_prompts,
    ),
    negative_constraints: list(
      record.negative_constraints ?? record.negativeConstraints ?? record.negative_prompt ?? record.negativePrompt,
      fallback.negative_constraints,
    ),
  };
}

function languagePackage(value: unknown, fallback: PromptLanguagePackage): PromptLanguagePackage {
  return readFlatPromptPackage(value, fallback);
}

export function ensureBilingualPromptPackage(promptPackage: PromptPackage): Required<Pick<PromptPackage, "zh" | "en">> {
  const record: Record<string, unknown> = isRecord(promptPackage) ? promptPackage : {};
  const flatFromSource = readFlatPromptPackage(record, DEFAULT_ZH_PROMPT);

  const zhFallback: PromptLanguagePackage = {
    main_prompt: flatFromSource.main_prompt || DEFAULT_ZH_PROMPT.main_prompt,
    variation_prompts: flatFromSource.variation_prompts.length > 0 ? flatFromSource.variation_prompts : DEFAULT_ZH_PROMPT.variation_prompts,
    negative_constraints:
      flatFromSource.negative_constraints.length > 0 ? flatFromSource.negative_constraints : DEFAULT_ZH_PROMPT.negative_constraints,
  };

  const enFallback: PromptLanguagePackage = {
    main_prompt: text(record.en && isRecord(record.en) ? record.en.main_prompt : undefined, DEFAULT_EN_PROMPT.main_prompt),
    variation_prompts: DEFAULT_EN_PROMPT.variation_prompts,
    negative_constraints: DEFAULT_EN_PROMPT.negative_constraints,
  };

  return {
    zh: languagePackage(record.zh, zhFallback),
    en: languagePackage(record.en, enFallback),
  };
}

export function normalizePromptPackage(promptPackage: PromptPackage): PromptPackage {
  const record: Record<string, unknown> = isRecord(promptPackage) ? promptPackage : {};
  const bilingual = ensureBilingualPromptPackage(promptPackage);
  const flatFallback = bilingual.zh;
  const flat = readFlatPromptPackage(record, flatFallback);

  return {
    ...promptPackage,
    main_prompt: flat.main_prompt,
    variation_prompts: flat.variation_prompts,
    negative_constraints: flat.negative_constraints,
    zh: bilingual.zh,
    en: bilingual.en,
  };
}

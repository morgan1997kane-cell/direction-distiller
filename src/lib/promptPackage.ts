import type { PromptLanguagePackage, PromptPackage } from "@/lib/types";

function list(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    return items.length > 0 ? items : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[\n,，、;；]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function languagePackage(value: unknown, fallback: PromptLanguagePackage): PromptLanguagePackage {
  const record = typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

  return {
    main_prompt: text(record.main_prompt ?? record.mainPrompt, fallback.main_prompt),
    variation_prompts: list(record.variation_prompts ?? record.variationPrompts, fallback.variation_prompts),
    negative_constraints: list(record.negative_constraints ?? record.negativeConstraints, fallback.negative_constraints),
  };
}

export function ensureBilingualPromptPackage(promptPackage: PromptPackage): Required<Pick<PromptPackage, "zh" | "en">> {
  const flatFallback: PromptLanguagePackage = {
    main_prompt: promptPackage.main_prompt,
    variation_prompts: promptPackage.variation_prompts,
    negative_constraints: promptPackage.negative_constraints,
  };

  const zhFallback: PromptLanguagePackage = {
    main_prompt: promptPackage.main_prompt || "以当前视觉方向为基础，生成一张主视觉探索图，强调主体层级、材质、光线和构图控制。",
    variation_prompts:
      promptPackage.variation_prompts.length > 0
        ? promptPackage.variation_prompts
        : ["更商业稳妥的主视觉版本", "更强记忆点的实验版本", "更容易落地制作的执行版本"],
    negative_constraints:
      promptPackage.negative_constraints.length > 0
        ? promptPackage.negative_constraints
        : ["避免主体不清", "避免廉价霓虹", "避免杂乱拼贴"],
  };

  const enFallback: PromptLanguagePackage = {
    main_prompt:
      promptPackage.en?.main_prompt ||
      promptPackage.main_prompt ||
      "proposal-ready key visual, clear subject hierarchy, controlled material detail, cinematic lighting, refined composition",
    variation_prompts:
      promptPackage.en?.variation_prompts?.length
        ? promptPackage.en.variation_prompts
        : [
            "client-safe key visual with restrained premium composition",
            "bolder campaign visual with a stronger memory point",
            "production-ready visual test with clear material and lighting control",
          ],
    negative_constraints:
      promptPackage.en?.negative_constraints?.length
        ? promptPackage.en.negative_constraints
        : ["avoid chaotic collage", "avoid unclear subject hierarchy", "avoid cheap glow"],
  };

  return {
    zh: languagePackage(promptPackage.zh, zhFallback || flatFallback),
    en: languagePackage(promptPackage.en, enFallback),
  };
}

export function normalizePromptPackage(promptPackage: PromptPackage): PromptPackage {
  const bilingual = ensureBilingualPromptPackage(promptPackage);

  return {
    ...promptPackage,
    zh: bilingual.zh,
    en: bilingual.en,
  };
}


import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAIProviderConfig, isSupportedModel, isSupportedProvider } from "@/lib/aiProvider";
import { extractJsonFromText } from "@/lib/extractJsonFromText";
import { normalizePromptPackage } from "@/lib/promptPackage";
import type { DirectionInput, DirectionResult, PromptPackage } from "@/lib/types";

export const runtime = "nodejs";

const sectionTypes = [
  "candidate_direction",
  "recommended_direction",
  "direction_package",
  "proposal_copy",
  "prompt_package",
  "execution_advice",
] as const;

type SectionType = (typeof sectionTypes)[number];

interface RefineSectionBody {
  sectionType?: unknown;
  currentResult?: unknown;
  brief?: unknown;
  provider?: unknown;
  model?: unknown;
  optionalInstruction?: unknown;
  candidateId?: unknown;
}

interface OllamaChatResponse {
  message?: {
    content?: unknown;
  };
  error?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSectionType(value: unknown): value is SectionType {
  return typeof value === "string" && (sectionTypes as readonly string[]).includes(value);
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown section refinement error";
}

function isVercelProduction() {
  return process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
}

function getCurrentSection(result: DirectionResult, sectionType: SectionType, candidateId?: string) {
  if (sectionType === "candidate_direction") {
    return result.candidate_directions.find((candidate) => candidate.id === candidateId) ?? result.candidate_directions[0];
  }

  if (sectionType === "recommended_direction") return result.recommended_direction;
  if (sectionType === "direction_package") return result.direction_package;
  if (sectionType === "proposal_copy") return result.proposal_copy;
  if (sectionType === "prompt_package") return result.prompt_package;
  return result.execution_advice;
}

function buildRefineSystemPrompt(sectionType: SectionType) {
  return [
    "You are Direction Distiller, a visual direction editor for senior visual designers.",
    "Regenerate only the requested section. Do not return the full DirectionResult.",
    "Return only one valid JSON object. No markdown, no code fence, no explanation outside JSON.",
    "Keep the existing product positioning: proposal-ready visual direction package for visual designers, not a chat reply.",
    "Use concrete visual language: material, lighting, composition, color, production path, proposal value, and risk.",
    "Do not claim real image recognition. Reference images are only metadata/context.",
    "If sectionType is candidate_direction, return one candidate object with id, type, title, one_line_concept, visual_keywords, mood_keywords, strength, risk, scores.",
    "If sectionType is prompt_package, return bilingual JSON: { zh: { main_prompt, variation_prompts, negative_constraints }, en: { main_prompt, variation_prompts, negative_constraints } }. Both variation_prompts arrays must contain exactly 3 items.",
    "For all other section types, return the exact section object shape used in the current result.",
    `Requested sectionType: ${sectionType}`,
  ].join("\n");
}

function buildRefineUserPrompt(input: {
  sectionType: SectionType;
  currentResult: DirectionResult;
  brief: DirectionInput;
  currentSection: unknown;
  optionalInstruction: string;
  candidateId?: string;
}) {
  return JSON.stringify(
    {
      sectionType: input.sectionType,
      candidateId: input.candidateId,
      optionalInstruction: input.optionalInstruction,
      originalInput: {
        brief: input.brief.brief,
        projectType: input.brief.projectType,
        outputGoal: input.brief.outputGoal,
        styleTags: input.brief.styleTags,
        referenceImageCount: input.brief.referenceImages.length,
        referenceImages: input.brief.referenceImages.map((image) => ({
          id: image.id,
          fileName: image.fileName,
          mimeType: image.type,
          size: image.size ?? 0,
        })),
      },
      currentSection: input.currentSection,
      contextResult: input.currentResult,
    },
    null,
    2,
  );
}

async function generateWithOllama(config: { baseURL: string; model: string }, systemPrompt: string, userPrompt: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  const endpoint = `${config.baseURL.replace(/\/$/, "")}/api/chat`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Ollama request failed with ${response.status}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    if (data.error) throw new Error(String(data.error));
    return typeof data.message?.content === "string" ? data.message.content : "";
  } finally {
    clearTimeout(timer);
  }
}

function unwrapSection(sectionType: SectionType, parsed: unknown) {
  if (!isRecord(parsed)) return parsed;

  if (sectionType === "candidate_direction") {
    return parsed.candidate_direction ?? parsed.candidate ?? parsed;
  }

  return parsed[sectionType] ?? parsed.section ?? parsed;
}

function normalizeReturnedSection(sectionType: SectionType, parsed: unknown) {
  const section = unwrapSection(sectionType, parsed);

  if (sectionType === "prompt_package" && isRecord(section)) {
    const flat: PromptPackage = {
      main_prompt: typeof section.main_prompt === "string" ? section.main_prompt : "",
      variation_prompts: Array.isArray(section.variation_prompts) ? section.variation_prompts.filter((item): item is string => typeof item === "string") : [],
      negative_constraints: Array.isArray(section.negative_constraints)
        ? section.negative_constraints.filter((item): item is string => typeof item === "string")
        : [],
      zh: isRecord(section.zh) ? (section.zh as unknown as PromptPackage["zh"]) : undefined,
      en: isRecord(section.en) ? (section.en as unknown as PromptPackage["en"]) : undefined,
    };

    return normalizePromptPackage(flat);
  }

  return section;
}

export async function POST(request: Request) {
  let body: RefineSectionBody;

  try {
    body = (await request.json()) as RefineSectionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  if (!isSectionType(body.sectionType)) {
    return NextResponse.json({ error: "Unsupported section type" }, { status: 400 });
  }

  if (!isRecord(body.currentResult)) {
    return NextResponse.json({ error: "currentResult is required" }, { status: 400 });
  }

  if (!isRecord(body.brief)) {
    return NextResponse.json({ error: "brief context is required" }, { status: 400 });
  }

  if (!isSupportedProvider(body.provider)) {
    return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
  }

  if (body.provider === "demo") {
    return NextResponse.json({ error: "Demo provider should refine locally" }, { status: 400 });
  }

  if (body.model !== undefined && !isSupportedModel(body.provider, body.model)) {
    return NextResponse.json({ error: "Unsupported model for selected provider" }, { status: 400 });
  }

  const currentResult = body.currentResult as unknown as DirectionResult;
  const brief = body.brief as unknown as DirectionInput;
  const candidateId = typeof body.candidateId === "string" ? body.candidateId : undefined;
  const optionalInstruction = typeof body.optionalInstruction === "string" ? body.optionalInstruction.trim() : "";
  const currentSection = getCurrentSection(currentResult, body.sectionType, candidateId);
  const config = getAIProviderConfig({ provider: body.provider, model: body.model });

  if (!config.apiKey) {
    return NextResponse.json({ error: `Missing API key for AI_PROVIDER=${config.provider}` }, { status: 500 });
  }

  if (config.provider === "ollama" && isVercelProduction()) {
    return NextResponse.json(
      { error: "Local / Ollama provider is only available when running Direction Distiller locally." },
      { status: 502 },
    );
  }

  const systemPrompt = buildRefineSystemPrompt(body.sectionType);
  const userPrompt = buildRefineUserPrompt({
    sectionType: body.sectionType,
    currentResult,
    brief,
    currentSection,
    optionalInstruction,
    candidateId,
  });

  try {
    const content =
      config.provider === "ollama"
        ? await generateWithOllama(config, systemPrompt, userPrompt)
        : (
            await new OpenAI({
              apiKey: config.apiKey,
              baseURL: config.baseURL,
              timeout: 60_000,
            }).chat.completions.create({
              model: config.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.65,
              max_tokens: 1200,
            })
          ).choices[0]?.message?.content ?? "";

    if (!content) {
      return NextResponse.json({ error: `${config.provider} returned an empty section response` }, { status: 502 });
    }

    console.log("refine-section raw response", {
      provider: config.provider,
      model: config.model,
      sectionType: body.sectionType,
      preview: content.slice(0, 1000),
    });

    const jsonText = extractJsonFromText(content);
    const parsed = JSON.parse(jsonText) as unknown;
    const section = normalizeReturnedSection(body.sectionType, parsed);

    return NextResponse.json({
      section,
      provider: config.provider,
      model: config.model,
    });
  } catch (error) {
    console.error("refine-section failed", {
      provider: config.provider,
      model: config.model,
      sectionType: body.sectionType,
      message: safeErrorMessage(error),
    });
    return NextResponse.json({ error: "Live section refinement failed" }, { status: 502 });
  }
}

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAIProviderConfig, isSupportedModel, isSupportedProvider, normalizeProvider } from "@/lib/aiProvider";
import { normalizeDirectionResult, validateDirectionResult } from "@/lib/directionSchema";
import { extractJsonFromText } from "@/lib/extractJsonFromText";
import { normalizeProviderDirectionResult } from "@/lib/normalizeDirectionResult";
import type { DirectionInput, ReferenceImage } from "@/lib/types";

export const runtime = "nodejs";

interface GenerateDirectionRequest {
  brief?: unknown;
  projectType?: unknown;
  outputGoal?: unknown;
  styleTags?: unknown;
  referenceImages?: unknown;
  provider?: unknown;
  model?: unknown;
}

interface ReferenceImagePayload {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
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

function sanitizeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function sanitizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function sanitizeReferenceImages(value: unknown): ReferenceImagePayload[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .slice(0, 6)
    .map((image, index) => ({
      id: sanitizeString(image.id, `reference-${index + 1}`),
      fileName: sanitizeString(image.fileName, `reference-${index + 1}`),
      mimeType: sanitizeString(image.mimeType, sanitizeString(image.type, "unknown")),
      size: typeof image.size === "number" && Number.isFinite(image.size) ? image.size : 0,
    }));
}

function toDirectionInput(request: GenerateDirectionRequest): DirectionInput {
  const referenceImages = sanitizeReferenceImages(request.referenceImages);

  return {
    brief: sanitizeString(request.brief),
    projectType: sanitizeString(request.projectType, "其他") as DirectionInput["projectType"],
    outputGoal: sanitizeString(request.outputGoal, "提案方向") as DirectionInput["outputGoal"],
    styleTags: sanitizeStringArray(request.styleTags) as DirectionInput["styleTags"],
    referenceImages: referenceImages.map<ReferenceImage>((image) => ({
      id: image.id,
      fileName: image.fileName,
      type: image.mimeType,
      size: image.size,
      previewUrl: "",
    })),
  };
}

function buildSystemPrompt() {
  return [
    "你是 Direction Distiller / 方向压缩器的服务端生成器。",
    "Direction Distiller 是视觉设计师的方向压缩器，不是泛聊天脑暴工具，也不是普通 Prompt 工具。",
    "你的任务是把用户输入的 brief、风格倾向、项目类型和参考图文本信息，压缩成可用于提案沟通和首轮视觉探索的视觉方向包。",
    "第一版只处理文本信息；参考图只能根据数量、文件名、MIME 类型和 size 做文本层面的参考摘要，不要声称你真实识别了图片内容。",
    "输出要像给视觉设计师、广告概念设计师、三维设计师看的提案方向，不要像普通 ChatGPT 聊天回复。",
    "所有主要文案使用中文；英文只允许作为辅助概念词或 prompt 中出现。",
    "评分标准是：清晰度、画面可控性、提案价值、执行可行性。",
    "必须输出 3 个候选方向，type 分别且只能是：稳妥型、大胆型、执行型。",
    "稳妥型适合客户沟通、风险低、容易进入提案；大胆型更有记忆点和传播感但风险更高；执行型最容易进入实际制作，强调生产可行性。",
    "candidate_directions 必须正好 3 个；scores 四项都必须是 0-100 的整数；recommended_direction.candidate_id 必须对应其中一个候选方向 id。",
    "不要输出 markdown，不要解释，不要包裹代码块，只返回 JSON object。",
    "JSON 必须包含这些顶层字段：id, createdAt, project_type, output_goal, input_summary, style_tags, reference_image_summary, candidate_directions, recommended_direction, direction_package, proposal_copy, prompt_package, execution_advice。",
    "reference_image_summary 每项必须包含：image_id, file_name, observed_style, color_tone, composition_notes, usable_elements。",
    "direction_package 必须包含：core_concept, mood, material, lighting, composition, color_palette, do_not。",
    "proposal_copy 必须包含：short_pitch, client_facing_description, internal_direction_note。",
    "prompt_package 必须包含：main_prompt, variation_prompts, negative_constraints。",
    "execution_advice 必须包含：first_step, recommended_workflow, risk_warning。",
  ].join("\n");
}

function buildQualitySystemPrompt() {
  return [
    "You are Direction Distiller, a visual direction compressor for senior visual designers. Your output is a proposal-ready visual direction package, not a chat reply and not a generic prompt list.",
    "Return only one valid JSON object. No markdown, no code fence, no explanation outside JSON. Main copy must be Chinese; English is allowed inside image-generation prompts or short concept words.",
    "Use the user's brief, project type, output goal, style tags, and reference image metadata only. Do not claim real image recognition. If images exist, summarize them as metadata/context signals.",
    "Make the result concrete: describe picture language, camera/composition, material, lighting, color, production path, risks, and proposal value. Avoid empty words like 高级, 科技感, 未来感 unless paired with specific visual execution.",
    "Top-level JSON keys required: id, createdAt, project_type, output_goal, input_summary, style_tags, reference_image_summary, candidate_directions, recommended_direction, direction_package, proposal_copy, prompt_package, execution_advice.",
    "candidate_directions must be exactly 3 items and visibly different. Types must be exactly: 稳妥型, 大胆型, 执行型.",
    "稳妥型: low risk, client-friendly, commercially acceptable, stable visual control. 大胆型: stronger memory point and communication value, more experimental, higher visual risk. 执行型: easiest to produce now, with explicit 3D / AI image / graphic / film execution path.",
    "Each candidate needs id, type, title, one_line_concept, visual_keywords, mood_keywords, strength, risk, scores. Titles and concepts must not be near-duplicates.",
    "Scores must show trade-offs, not average values. Use a wider range such as 58-94. 稳妥型 usually has higher clarity and execution_feasibility; 大胆型 can have high proposal_value but lower execution_feasibility; 执行型 should have higher visual_control and execution_feasibility.",
    "recommended_direction must make a judgment. Explain why this route is the best balance for the user's goal, and candidate_id must match one candidate id.",
    "direction_package requirements: core_concept = one clear visual strategy; mood = specific emotional texture; material = concrete surfaces such as metal, glass, particles, fog, textile, skin, interface layers; lighting = concrete lighting such as low-angle rim light, cold white edge light, compressed top light, tunnel streak light; composition = camera/layout language such as low-angle close-up, center symmetry, telephoto compression, overhead structure; color_palette = specific color/tone descriptions; do_not = concrete off-track items.",
    "proposal_copy requirements: short_pitch is short and strong for a PPT page; client_facing_description is professional and easy for clients to understand; internal_direction_note gives concrete execution reminders for designers.",
    "prompt_package requirements: return bilingual prompts with zh and en objects. Shape: prompt_package: { zh: { main_prompt, variation_prompts, negative_constraints }, en: { main_prompt, variation_prompts, negative_constraints } }. Also include legacy flat main_prompt, variation_prompts, negative_constraints for compatibility. Each variation_prompts array must contain exactly 3 clearly different variants. Negative constraints must include practical avoid items such as chaotic collage, unclear subject, cheap glow, messy typography, over-stylized effects.",
    "execution_advice must include first_step, recommended_workflow, risk_warning with practical production advice, not generic encouragement.",
  ].join("\n");
}

function buildUserPrompt(input: DirectionInput) {
  return JSON.stringify(
    {
      brief: input.brief,
      projectType: input.projectType,
      outputGoal: input.outputGoal,
      styleTags: input.styleTags,
      referenceImageCount: input.referenceImages.length,
      referenceImages: input.referenceImages.map((image) => ({
        id: image.id,
        fileName: image.fileName,
        mimeType: image.type,
        size: image.size ?? 0,
      })),
    },
    null,
    2,
  );
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown generation error";
}

function isVercelProduction() {
  return process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
}

async function generateWithOllama(config: { baseURL: string; model: string }, input: DirectionInput) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  const endpoint = `${config.baseURL.replace(/\/$/, "")}/api/chat`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: buildQualitySystemPrompt() },
          { role: "user", content: buildUserPrompt(input) },
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
    if (data.error) {
      throw new Error(String(data.error));
    }

    const content = data.message?.content;
    return typeof content === "string" ? content : "";
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: GenerateDirectionRequest;

  try {
    body = (await request.json()) as GenerateDirectionRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const input = toDirectionInput(body);

  if (!input.brief.trim() && input.referenceImages.length === 0) {
    return NextResponse.json({ error: "brief or referenceImages is required" }, { status: 400 });
  }

  if (body.provider !== undefined && !isSupportedProvider(body.provider)) {
    return NextResponse.json({ error: "Unsupported AI provider" }, { status: 400 });
  }

  const requestedProvider = body.provider === undefined ? normalizeProvider(process.env.AI_PROVIDER) : body.provider;
  if (requestedProvider === "demo") {
    return NextResponse.json({ error: "Demo provider should be generated on the client" }, { status: 400 });
  }
  if (body.model !== undefined && !isSupportedModel(requestedProvider, body.model)) {
    return NextResponse.json({ error: "Unsupported model for selected provider" }, { status: 400 });
  }

  const config = getAIProviderConfig({ provider: requestedProvider, model: body.model });
  if (!config.apiKey) {
    return NextResponse.json({ error: `Missing API key for AI_PROVIDER=${config.provider}` }, { status: 500 });
  }

  try {
    let content = "";

    if (config.provider === "ollama") {
      if (isVercelProduction()) {
        return NextResponse.json(
          { error: "Local / Ollama provider is only available when running Direction Distiller locally." },
          { status: 502 },
        );
      }

      content = await generateWithOllama(config, input);
    } else {
      const client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        timeout: 60_000,
      });

      const completion = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: buildQualitySystemPrompt() },
          { role: "user", content: buildUserPrompt(input) },
        ],
        temperature: 0.7,
        max_tokens: 2200,
      });

      content = completion.choices[0]?.message?.content ?? "";
    }

    if (!content) {
      console.error("generate-direction empty response", {
        provider: config.provider,
        model: config.model,
      });
      return NextResponse.json({ error: `${config.provider} returned an empty response` }, { status: 502 });
    }

    console.log("generate-direction raw response", {
      provider: config.provider,
      model: config.model,
      preview: content.slice(0, 1000),
    });

    let parsed: unknown;
    try {
      const jsonText = extractJsonFromText(content);
      parsed = JSON.parse(jsonText) as unknown;
      console.log("generate-direction json extraction succeeded", {
        provider: config.provider,
        model: config.model,
        length: jsonText.length,
      });
    } catch (error) {
      console.error("generate-direction json extraction failed", {
        provider: config.provider,
        model: config.model,
        message: safeErrorMessage(error),
      });
      return NextResponse.json({ error: "Live AI JSON extraction failed" }, { status: 502 });
    }

    const normalized = normalizeProviderDirectionResult(parsed, input);
    if (!normalized) {
      console.error("generate-direction normalization failed", {
        provider: config.provider,
        model: config.model,
        reason: "normalizeProviderDirectionResult returned null",
      });
      return NextResponse.json({ error: `${config.provider} returned an unrecoverable DirectionResult` }, { status: 502 });
    }

    const result = normalizeDirectionResult(normalized, input, "live", config.provider, config.model);

    if (!validateDirectionResult(result)) {
      console.error("generate-direction validation failed after normalization", {
        provider: config.provider,
        model: config.model,
      });
      return NextResponse.json({ error: `${config.provider} returned an incompatible DirectionResult` }, { status: 502 });
    }

    console.log("generate-direction normalization succeeded", {
      provider: config.provider,
      model: config.model,
      candidates: result.candidate_directions.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("generate-direction failed", {
      provider: config.provider,
      model: config.model,
      message: safeErrorMessage(error),
    });
    return NextResponse.json({ error: "Live AI generation failed" }, { status: 502 });
  }
}

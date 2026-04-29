import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  directionResultJsonSchema,
  normalizeDirectionResult,
  validateDirectionResult,
} from "@/lib/directionSchema";
import type { DirectionInput, ReferenceImage } from "@/lib/types";

export const runtime = "nodejs";

interface GenerateDirectionRequest {
  brief?: unknown;
  projectType?: unknown;
  outputGoal?: unknown;
  styleTags?: unknown;
  referenceImages?: unknown;
}

interface ReferenceImagePayload {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
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

function buildInstructions() {
  return [
    "你是 Direction Distiller / 方向压缩器的服务端生成器。",
    "Direction Distiller 是视觉设计师的方向压缩器，不是泛聊天脑暴工具，也不是普通 Prompt 工具。",
    "你的任务是把用户输入的 brief、风格倾向、项目类型和参考图文本信息，压缩成可用于提案沟通和首轮视觉探索的视觉方向包。",
    "第一版只处理文本信息；参考图只能根据数量、文件名、MIME 类型做文本层面的参考摘要，不要声称你真实识别了图片内容。",
    "输出要像给视觉设计师、广告概念设计师、三维设计师看的提案方向，不要像普通 ChatGPT 聊天回复。",
    "所有主要文案使用中文；英文只允许作为辅助概念词或 prompt 中出现。",
    "评分标准是：清晰度、画面可控性、提案价值、执行可行性。",
    "必须输出 3 个候选方向，type 分别且只能是：稳妥型、大胆型、执行型。",
    "稳妥型适合客户沟通、风险低、容易进入提案；大胆型更有记忆点和传播感但风险更高；执行型最容易进入实际制作，强调生产可行性。",
    "candidate_directions 必须正好 3 个；scores 四项都必须是 0-100 的整数；recommended_direction.candidate_id 必须对应其中一个候选方向 id。",
    "不要输出 markdown，不要解释，不要包裹代码块，只返回符合 schema 的 JSON。",
  ].join("\n");
}

function buildInput(input: DirectionInput) {
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const client = new OpenAI({ apiKey, timeout: 60_000 });

  try {
    const response = await client.responses.create({
      model,
      instructions: buildInstructions(),
      input: buildInput(input),
      max_output_tokens: 5000,
      text: {
        format: {
          type: "json_schema",
          name: "direction_result",
          strict: true,
          schema: directionResultJsonSchema,
        },
      },
    });

    if (!response.output_text) {
      return NextResponse.json({ error: "OpenAI returned an empty response" }, { status: 502 });
    }

    const parsed = JSON.parse(response.output_text) as unknown;

    if (!validateDirectionResult(parsed)) {
      return NextResponse.json({ error: "OpenAI returned an incompatible DirectionResult" }, { status: 502 });
    }

    return NextResponse.json(normalizeDirectionResult(parsed, input, "live"));
  } catch (error) {
    console.error("generate-direction failed", safeErrorMessage(error));
    return NextResponse.json({ error: "Live AI generation failed" }, { status: 502 });
  }
}

import { normalizeDirectionResult, validateDirectionResult } from "@/lib/directionSchema";
import type { AIProvider } from "@/lib/aiProvider";
import type { DirectionInput, DirectionResult } from "@/lib/types";

const REQUEST_TIMEOUT_MS = 60_000;

interface GenerateDirectionOptions {
  provider: Exclude<AIProvider, "demo">;
  model: string;
}

export async function generateDirection(input: DirectionInput, options: GenerateDirectionOptions): Promise<DirectionResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/generate-direction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brief: input.brief,
        projectType: input.projectType,
        outputGoal: input.outputGoal,
        styleTags: input.styleTags,
        provider: options.provider,
        model: options.model,
        referenceImages: input.referenceImages.map((image) => ({
          id: image.id,
          fileName: image.fileName,
          mimeType: image.type,
          size: image.size ?? 0,
        })),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed with ${response.status}`);
    }

    const data = (await response.json()) as unknown;
    if (!validateDirectionResult(data)) {
      throw new Error("Live API returned an incompatible DirectionResult");
    }

    return normalizeDirectionResult(data, input, "live", options.provider, options.model);
  } finally {
    window.clearTimeout(timer);
  }
}

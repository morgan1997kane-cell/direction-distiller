export const SUPPORTED_MODELS = {
  demo: ["Demo Generator"],
  deepseek: ["deepseek-chat"],
  gemini: ["gemini-2.5-flash"],
  openai: ["gpt-5.4-mini", "gpt-5.5"],
  ollama: ["qwen2.5:7b", "qwen2.5:14b", "llama3.1:8b", "deepseek-r1:7b"],
} as const;

export const SUPPORTED_PROVIDERS = Object.keys(SUPPORTED_MODELS) as AIProvider[];

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  demo: "Demo",
  deepseek: "DeepSeek",
  gemini: "Gemini",
  openai: "OpenAI",
  ollama: "Local / Ollama",
};

export type AIProvider = keyof typeof SUPPORTED_MODELS;
export type LiveAIProvider = Exclude<AIProvider, "demo">;

export interface AIProviderConfig {
  provider: LiveAIProvider;
  apiKey: string | undefined;
  baseURL: string;
  model: string;
}

export function isSupportedProvider(value: unknown): value is AIProvider {
  return typeof value === "string" && value in SUPPORTED_MODELS;
}

export function getDefaultModel(provider: AIProvider) {
  return SUPPORTED_MODELS[provider][0];
}

export function isSupportedModel(provider: AIProvider, model: unknown): model is string {
  return typeof model === "string" && (SUPPORTED_MODELS[provider] as readonly string[]).includes(model);
}

export function normalizeProvider(value: unknown): AIProvider {
  return isSupportedProvider(value) ? value : "deepseek";
}

export function normalizeModel(provider: AIProvider, model: unknown) {
  return isSupportedModel(provider, model) ? model : getDefaultModel(provider);
}

export function getAIProviderConfig(options?: { provider?: unknown; model?: unknown }): AIProviderConfig {
  const provider = normalizeProvider(options?.provider ?? process.env.AI_PROVIDER);

  if (provider === "demo") {
    throw new Error("Demo provider does not use the live API");
  }

  const providerModel =
    provider === "openai"
      ? process.env.OPENAI_MODEL
      : provider === "gemini"
        ? process.env.GEMINI_MODEL
        : provider === "ollama"
          ? process.env.OLLAMA_MODEL
          : process.env.DEEPSEEK_MODEL;
  const model = normalizeModel(provider, options?.model ?? providerModel);

  if (provider === "openai") {
    return {
      provider,
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model,
    };
  }

  if (provider === "gemini") {
    return {
      provider,
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
      model,
    };
  }

  if (provider === "ollama") {
    return {
      provider,
      apiKey: "ollama",
      baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model,
    };
  }

  return {
    provider,
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model,
  };
}

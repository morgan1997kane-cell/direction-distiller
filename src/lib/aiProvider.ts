export type AIProvider = "deepseek" | "gemini" | "openai";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string | undefined;
  baseURL: string;
  model: string;
}

function normalizeProvider(value: string | undefined): AIProvider {
  if (value === "gemini" || value === "openai") return value;
  return "deepseek";
}

export function getAIProviderConfig(): AIProviderConfig {
  const provider = normalizeProvider(process.env.AI_PROVIDER);

  if (provider === "openai") {
    return {
      provider,
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-5.5",
    };
  }

  if (provider === "gemini") {
    return {
      provider,
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai/",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    };
  }

  return {
    provider,
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  };
}

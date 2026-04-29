export type AIProvider = "deepseek" | "openai";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string | undefined;
  baseURL: string;
  model: string;
}

function normalizeProvider(value: string | undefined): AIProvider {
  return value === "openai" ? "openai" : "deepseek";
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

  return {
    provider,
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  };
}

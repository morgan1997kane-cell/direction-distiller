"use client";

import { useEffect, useState } from "react";
import {
  getDefaultModel,
  PROVIDER_LABELS,
  SUPPORTED_MODELS,
  SUPPORTED_PROVIDERS,
  type AIProvider,
} from "@/lib/aiProvider";

interface AIProviderSelectorProps {
  provider: AIProvider;
  model: string;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: string) => void;
}

export function AIProviderSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: AIProviderSelectorProps) {
  const modelOptions = SUPPORTED_MODELS[provider];
  const [isLocalPage, setIsLocalPage] = useState(false);

  useEffect(() => {
    setIsLocalPage(["localhost", "127.0.0.1", "::1"].includes(window.location.hostname));
  }, []);

  return (
    <section className="border border-white/10 bg-black/25 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/45">AI Settings</p>
          <h3 className="mt-1 text-sm font-medium text-zinc-200">Provider / Model</h3>
        </div>
        <span className="text-xs text-zinc-600">{provider === "demo" ? "Local" : provider === "ollama" ? "Local API" : "Live API"}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs text-zinc-500">Provider</span>
          <select
            value={provider}
            onChange={(event) => onProviderChange(event.target.value as AIProvider)}
            className="h-10 border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition hover:border-white/20 focus:border-cyan-200/40"
          >
            {SUPPORTED_PROVIDERS.map((item) => (
              <option key={item} value={item}>
                {PROVIDER_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs text-zinc-500">Model</span>
          <select
            value={(modelOptions as readonly string[]).includes(model) ? model : getDefaultModel(provider)}
            onChange={(event) => onModelChange(event.target.value)}
            disabled={provider === "demo"}
            className="h-10 border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition hover:border-white/20 focus:border-cyan-200/40 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {modelOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {provider === "ollama" ? (
        <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-zinc-500">
          {isLocalPage
            ? "Local / Ollama 仅在本地运行版本可用。请先启动本地模型服务，例如 Ollama。"
            : "线上版本无法访问你的本地模型服务，请在本地运行项目后使用 Local / Ollama。"}
        </p>
      ) : null}
    </section>
  );
}

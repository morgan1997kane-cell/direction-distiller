"use client";

import { useState } from "react";
import type { PromptLanguagePackage, PromptPackage } from "@/lib/types";
import { ensureBilingualPromptPackage } from "@/lib/promptPackage";
import { copyText } from "@/lib/copy";

export function PromptPackageCard({ promptPackage }: { promptPackage: PromptPackage }) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const [copied, setCopied] = useState(false);
  const bilingual = ensureBilingualPromptPackage(promptPackage);
  const active = bilingual[language];

  async function copyActivePrompt() {
    await copyText(formatPromptLanguage(active));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="border border-white/10 bg-zinc-950/85 p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">Prompt Draft</p>
          <h2 className="mt-2 text-xl font-medium text-zinc-50">Prompt 草稿</h2>
          <p className="mt-2 text-sm text-zinc-500">固定提供中文与英文两个版本，便于提案沟通和生图测试。</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-white/10 bg-black/35 p-1">
            <TabButton active={language === "zh"} onClick={() => setLanguage("zh")}>
              中文版
            </TabButton>
            <TabButton active={language === "en"} onClick={() => setLanguage("en")}>
              English Version
            </TabButton>
          </div>
          <button
            type="button"
            onClick={copyActivePrompt}
            className="border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 transition hover:border-cyan-200/30 hover:text-cyan-50"
          >
            {copied ? "已复制" : "复制当前版本"}
          </button>
        </div>
      </div>

      <div className="mt-5 border border-white/10 bg-black/45 p-4">
        <p className="mb-3 text-xs text-zinc-500">{language === "zh" ? "主 Prompt" : "Main Prompt"}</p>
        <p className="font-mono text-xs leading-6 text-zinc-300">{active.main_prompt}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {active.variation_prompts.map((prompt, index) => (
          <div key={`${language}-${index}-${prompt}`} className="border border-white/10 bg-white/[0.025] p-3">
            <p className="mb-2 text-xs text-zinc-600">{language === "zh" ? `变体 ${index + 1}` : `Variation ${index + 1}`}</p>
            <p className="font-mono text-xs leading-6 text-zinc-400">{prompt}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-zinc-500">negative constraints / 限制词</p>
        <div className="flex flex-wrap gap-2">
          {active.negative_constraints.map((item) => (
            <span key={`${language}-${item}`} className="border border-white/10 px-2.5 py-1 text-xs text-zinc-500">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 text-xs transition",
        active ? "bg-cyan-300/10 text-cyan-50" : "text-zinc-500 hover:text-zinc-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function formatPromptLanguage(prompt: PromptLanguagePackage) {
  return [
    "Main Prompt",
    prompt.main_prompt,
    "",
    "Variation Prompts",
    ...prompt.variation_prompts.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Negative Constraints",
    ...prompt.negative_constraints.map((item) => `- ${item}`),
  ].join("\n");
}

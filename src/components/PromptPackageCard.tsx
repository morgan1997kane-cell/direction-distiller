import type { PromptPackage } from "@/lib/types";

export function PromptPackageCard({ promptPackage }: { promptPackage: PromptPackage }) {
  return (
    <section className="border border-white/10 bg-zinc-950/85 p-5 md:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-600">Prompt Draft</p>
        <h2 className="mt-2 text-xl font-medium text-zinc-50">Prompt 草稿</h2>
        <p className="mt-2 text-sm text-zinc-500">用于首轮探索，视觉判断仍以前面的方向包为准。</p>
      </div>

      <div className="mt-5 border border-white/10 bg-black/45 p-4">
        <p className="mb-3 text-xs text-zinc-500">主 prompt</p>
        <p className="font-mono text-xs leading-6 text-zinc-300">{promptPackage.main_prompt}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {promptPackage.variation_prompts.map((prompt, index) => (
          <div key={prompt} className="border border-white/10 bg-white/[0.025] p-3">
            <p className="mb-2 text-xs text-zinc-600">变体 {index + 1}</p>
            <p className="font-mono text-xs leading-6 text-zinc-400">{prompt}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-zinc-500">negative constraints / 限制词</p>
        <div className="flex flex-wrap gap-2">
          {promptPackage.negative_constraints.map((item) => (
            <span key={item} className="border border-white/10 px-2.5 py-1 text-xs text-zinc-500">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

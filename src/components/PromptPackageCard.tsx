import type { PromptPackage } from "@/lib/types";

export function PromptPackageCard({ promptPackage }: { promptPackage: PromptPackage }) {
  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-zinc-50">Prompt 草稿</h2>
          <p className="mt-1 text-xs text-zinc-500">辅助首轮探索，不替代方向判断</p>
        </div>
      </div>
      <div className="mt-5 rounded-md border border-white/10 bg-black/50 p-4 font-mono text-xs leading-6 text-zinc-300">
        {promptPackage.main_prompt}
      </div>
      <div className="mt-5 grid gap-3">
        {promptPackage.variation_prompts.map((prompt, index) => (
          <div key={prompt} className="rounded-md border border-white/10 bg-white/[0.025] p-3">
            <p className="mb-1 text-xs text-zinc-500">变体 {index + 1}</p>
            <p className="font-mono text-xs leading-6 text-zinc-300">{prompt}</p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <p className="mb-2 text-xs text-zinc-500">negative constraints / 限制词</p>
        <div className="flex flex-wrap gap-2">
          {promptPackage.negative_constraints.map((item) => (
            <span key={item} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

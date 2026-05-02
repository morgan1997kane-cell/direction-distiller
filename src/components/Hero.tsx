const capabilityTags = ["方向候选", "提案文案", "Prompt 草稿"];

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-20 md:pb-20 md:pt-28">
      <div className="pointer-events-none absolute inset-x-5 top-10 h-80 bg-[radial-gradient(circle_at_30%_20%,rgba(226,232,240,0.16),transparent_28rem)] opacity-80" />

      <div className="relative grid gap-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="max-w-5xl">
          <p className="text-xs uppercase tracking-[0.32em] text-zinc-500">Direction Distiller</p>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[1.05] text-zinc-50 md:text-7xl">
            把零散灵感压成可提案的视觉方向
          </h1>
          <p className="mt-7 max-w-3xl text-base uppercase tracking-[0.18em] text-zinc-500 md:text-lg">
            Distill scattered ideas into proposal-ready visual directions.
          </p>
          <p className="mt-8 max-w-3xl text-lg leading-9 text-zinc-300">
            输入 brief、参考图和风格倾向，生成可用于客户沟通、团队脑暴和首轮视觉探索的方向包。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {capabilityTags.map((tag) => (
              <span key={tag} className="border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <aside className="border-l border-white/10 pl-6 text-sm leading-7 text-zinc-400">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">Creative Direction Engine</p>
          <p className="mt-5">
            从模糊感觉进入可判断方向。先收束视觉策略，再进入提案文案、Prompt 和执行路径。
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {["Brief", "Routes", "Pitch"].map((label, index) => (
              <div key={label} className="border-t border-white/10 pt-4">
                <p className="font-mono text-sm text-zinc-500">0{index + 1}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

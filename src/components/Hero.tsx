const capabilityTags = ["方向候选", "提案文案", "双语 Prompt"];

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-24 md:pb-24 md:pt-32">
      <div className="pointer-events-none absolute inset-x-5 top-12 h-[30rem] bg-[radial-gradient(circle_at_24%_18%,rgba(226,232,240,0.15),transparent_32rem)] opacity-85" />

      <div className="relative">
        <div className="max-w-6xl">
          <p className="text-xs uppercase tracking-[0.34em] text-zinc-500">Direction Distiller</p>
          <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[1.06] text-zinc-50 md:text-7xl lg:text-8xl">
            把零散灵感压成可提案的视觉方向
          </h1>
          <p className="mt-8 max-w-3xl text-sm uppercase leading-7 tracking-[0.18em] text-zinc-500 md:text-base">
            Distill scattered ideas into proposal-ready visual directions.
          </p>
          <p className="mt-8 max-w-3xl text-lg leading-9 text-zinc-300 md:text-xl md:leading-10">
            输入 brief、参考图和风格倾向，生成可用于客户沟通、团队脑暴和首轮视觉探索的方向包。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {capabilityTags.map((tag) => (
              <span key={tag} className="quiet-panel px-4 py-2 text-sm text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-3">
          {[
            ["01", "Brief", "把模糊项目、参考图和客户诉求收束成一个创意输入。"],
            ["02", "Direction", "比较稳妥、大胆、执行三种路线，先形成判断。"],
            ["03", "Proposal", "输出方向包、提案文案、Prompt 与下一步行动。"],
          ].map(([index, label, body]) => (
            <article key={label} className="max-w-sm">
              <p className="font-mono text-xs text-zinc-600">{index}</p>
              <h2 className="mt-4 text-sm uppercase tracking-[0.22em] text-zinc-300">{label}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-500">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 hidden h-20 items-end justify-end md:flex">
          <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="ml-5 max-w-xs text-right text-xs uppercase leading-6 tracking-[0.2em] text-zinc-600">
            Creative direction engine for early visual proposals
          </div>
        </div>
      </div>
    </section>
  );
}

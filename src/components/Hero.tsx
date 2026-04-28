export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-8 pt-16 md:pt-24">
      <div className="max-w-4xl">
        <div className="mb-5 inline-flex items-center gap-3 border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-cyan-100/70">
          Direction Distiller
        </div>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-zinc-50 md:text-6xl">
          把零散灵感压成可提案的视觉方向
        </h1>
        <p className="mt-5 max-w-2xl text-sm uppercase tracking-[0.18em] text-zinc-500 md:text-base">
          Distill scattered ideas into proposal-ready visual directions.
        </p>
        <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
          输入 brief、灵感和参考图，快速生成一套可用于提案沟通、团队脑暴和首轮视觉探索的方向包。
        </p>
      </div>

      <div className="grid max-w-3xl grid-cols-3 border-y border-white/10 text-sm text-zinc-500">
        {["Brief", "References", "Direction Pack"].map((item) => (
          <div key={item} className="border-r border-white/10 px-4 py-3 last:border-r-0">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

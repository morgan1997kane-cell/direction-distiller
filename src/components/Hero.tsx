export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-16 md:pt-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-cyan-100/70">
            Direction Distiller
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-zinc-50 md:text-6xl">
            把零散灵感压成可提案的视觉方向
          </h1>
          <p className="mt-5 max-w-2xl text-sm uppercase tracking-[0.18em] text-zinc-500 md:text-base">
            Distill scattered ideas into proposal-ready visual directions.
          </p>
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
            输入 brief、灵感片段与参考图，系统会将它们压缩成一套可用于客户沟通、团队脑暴和首轮视觉探索的方向包。
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/80 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Proposal Engine</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ["01", "Brief"],
              ["02", "Routes"],
              ["03", "Pitch"],
            ].map(([index, label]) => (
              <div key={label} className="border border-white/10 bg-white/[0.03] px-3 py-4">
                <p className="font-mono text-lg text-cyan-100">{index}</p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-zinc-400">
            从模糊感觉进入可判断方向。先收束，再执行。
          </p>
        </div>
      </div>
    </section>
  );
}

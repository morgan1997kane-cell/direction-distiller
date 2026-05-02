const audiences = [
  "三维视觉设计师",
  "品牌 / 平面视觉设计师",
  "AI 视觉创作者",
  "广告概念设计师",
  "影像概念设计师",
  "UI / HMI 设计师",
];

const outputs = [
  "3 个视觉方向候选",
  "1 个系统推荐方向",
  "一套视觉方向包",
  "一组提案文案",
  "一组双语 prompt 草稿",
  "下一步执行建议",
];

export function ProductIntro() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-16">
      <div className="border-y border-white/10 py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/45">Why Direction Distiller</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-zinc-50 md:text-5xl">
              不是多生成几张图，而是更快形成判断。
            </h2>
            <div className="mt-8 max-w-3xl space-y-5 text-base leading-8 text-zinc-400">
              <p>
                AI 生成能力越来越强，但视觉项目真正难的不是“生成更多图”，而是把模糊感觉、参考图和项目 brief
                快速收束成一个可以沟通、可以判断、可以继续执行的视觉方向。
              </p>
              <p>
                Direction Distiller 不替你堆空泛创意，它帮你更快结束混乱脑暴，进入提案、团队协作和首轮视觉探索。
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <IntroList title="适合谁使用" items={audiences} />
            <IntroList title="你会得到" items={outputs} />
          </div>
        </div>
      </div>
    </section>
  );
}

function IntroList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-t border-white/10 pt-5">
      <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-zinc-400">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

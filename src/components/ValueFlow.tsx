const valueItems = [
  {
    title: "捕捉灵感",
    label: "Capture",
    body: "把零散 brief、画面想法和参考图快速收拢。",
  },
  {
    title: "压缩方向",
    label: "Distill",
    body: "生成 3 个可比较的视觉方向，并给出推荐判断。",
  },
  {
    title: "进入提案",
    label: "Proposal",
    body: "输出方向包、提案文案和首轮 prompt 草稿。",
  },
];

export function ValueFlow() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-8">
      <div className="grid gap-3 md:grid-cols-3">
        {valueItems.map((item, index) => (
          <article key={item.title} className="border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">{item.label}</p>
              <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
            </div>
            <h2 className="mt-4 text-base font-medium text-zinc-100">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

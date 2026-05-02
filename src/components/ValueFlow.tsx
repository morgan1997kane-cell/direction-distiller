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
    <section className="mx-auto w-full max-w-7xl px-5 pb-12">
      <div className="grid border-y border-white/10 md:grid-cols-3">
        {valueItems.map((item, index) => (
          <article
            key={item.title}
            className="border-white/10 py-6 md:border-r md:px-6 md:last:border-r-0"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-600">0{index + 1}</span>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/45">{item.label}</p>
            </div>
            <h2 className="mt-5 text-xl font-medium text-zinc-100">{item.title}</h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-zinc-500">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

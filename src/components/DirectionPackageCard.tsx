import type { DirectionPackage } from "@/lib/types";

const groups: Array<[keyof DirectionPackage, string, string]> = [
  ["mood", "情绪关键词", "Mood"],
  ["material", "材质关键词", "Material"],
  ["lighting", "光线关键词", "Lighting"],
  ["composition", "构图 / 镜头关键词", "Composition"],
  ["color_palette", "色调关键词", "Palette"],
  ["do_not", "禁止项 / 避免跑偏", "Guardrails"],
];

export function DirectionPackageCard({ directionPackage }: { directionPackage: DirectionPackage }) {
  return (
    <section className="border border-white/10 bg-white/[0.025] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Strategy Board</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">视觉方向包</h2>
        </div>
      </div>

      <div className="mt-6 border border-white/10 bg-black/25 p-5">
        <p className="text-xs text-zinc-500">核心概念</p>
        <p className="mt-3 text-base leading-8 text-zinc-200">{directionPackage.core_concept}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([key, title, label]) => (
          <div key={key} className="border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/40">{label}</p>
            <h3 className="mt-2 text-sm font-medium text-zinc-100">{title}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(directionPackage[key] as string[]).map((item) => (
                <span key={item} className="border border-white/10 bg-white/[0.035] px-2 py-1 text-xs text-zinc-400">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

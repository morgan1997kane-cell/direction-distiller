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
    <section className="bg-white/[0.025] p-5 md:p-7">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Strategy Board</p>
        <h2 className="mt-3 text-3xl font-semibold text-zinc-50">视觉方向包</h2>
      </div>

      <div className="mt-7 border-l border-cyan-100/25 pl-5">
        <p className="text-xs text-zinc-500">核心概念</p>
        <p className="mt-3 max-w-4xl text-lg leading-9 text-zinc-200">{directionPackage.core_concept}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map(([key, title, label]) => (
          <div key={key} className="border-t border-white/10 pt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/40">{label}</p>
            <h3 className="mt-2 text-base font-medium text-zinc-100">{title}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(directionPackage[key] as string[]).map((item) => (
                <span key={item} className="border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-zinc-400">
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

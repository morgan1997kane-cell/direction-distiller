import type { DirectionPackage } from "@/lib/types";

const rows: Array<[keyof DirectionPackage, string]> = [
  ["mood", "情绪关键词"],
  ["material", "材质关键词"],
  ["lighting", "光线关键词"],
  ["composition", "构图/镜头关键词"],
  ["color_palette", "色调关键词"],
  ["do_not", "禁止项 / 避免跑偏"],
];

export function DirectionPackageCard({ directionPackage }: { directionPackage: DirectionPackage }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
      <h2 className="text-xl font-medium text-zinc-50">视觉方向包</h2>
      <p className="mt-4 text-sm leading-7 text-zinc-300">{directionPackage.core_concept}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {rows.map(([key, label]) => (
          <div key={key} className="border-t border-white/10 pt-3">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {(directionPackage[key] as string[]).join("、")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import type { DirectionResult } from "@/lib/types";
import type { WorkflowStep } from "@/components/WorkflowStepper";

interface NextActionPanelProps {
  step: WorkflowStep;
  result?: DirectionResult | null;
  saved?: boolean;
  edited?: boolean;
}

export function NextActionPanel({ step, result, saved = false, edited = false }: NextActionPanelProps) {
  const isDemo = result?.ai_mode === "demo";
  const title =
    step === "archive"
      ? "已归档，可以稍后继续"
      : step === "export"
        ? "可以交付或继续打磨"
        : result
          ? "建议先检查推荐方向"
          : "先输入一个 brief";

  const actions = result
    ? [
        isDemo ? "当前是 Demo 结果，可用于演示流程；如需真实生成，请检查 provider / API key。" : "先查看推荐方向是否成立。",
        "如果方向不准，可以局部重生成推荐方向或候选卡片。",
        edited ? "当前结果已修改并自动保存，可以导出或保存到项目库。" : "如果内容可用，可以复制客户版或导出 Markdown。",
        saved ? "已保存到 Project Archive，稍后可从方向归档恢复继续编辑。" : "想保留这个版本时，点击保存到 Project Archive。",
      ]
    : ["先输入一个 brief，或点击下方示例开始。", "可选上传参考图；当前只使用文件名和 metadata 作为文本上下文。", "高级用户可展开 AI 引擎设置切换 provider / model。"];

  return (
    <section className="border border-cyan-200/15 bg-cyan-300/[0.045] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/45">Next Action</p>
          <h3 className="mt-1 text-base font-medium text-zinc-100">{title}</h3>
        </div>
        {result ? (
          <span className="w-fit border border-white/10 bg-black/25 px-2.5 py-1 text-xs text-zinc-400">
            {result.ai_mode === "live" ? `Live · ${result.ai_provider ?? "Provider"}` : "Demo"}
          </span>
        ) : null}
      </div>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-zinc-400 md:grid-cols-2">
        {actions.map((action) => (
          <li key={action} className="border-t border-white/10 pt-2">
            {action}
          </li>
        ))}
      </ul>
    </section>
  );
}

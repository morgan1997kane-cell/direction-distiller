"use client";

export type WorkflowStep = "input" | "generate" | "refine" | "export" | "archive";

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
}

const steps: { id: WorkflowStep; label: string; caption: string }[] = [
  { id: "input", label: "Input", caption: "输入" },
  { id: "generate", label: "Generate", caption: "生成" },
  { id: "refine", label: "Refine", caption: "修正" },
  { id: "export", label: "Export", caption: "导出" },
  { id: "archive", label: "Archive", caption: "归档" },
];

export function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  const activeIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav className="mb-8 overflow-x-auto border-b border-white/10 pb-4" aria-label="Direction workflow">
      <ol className="flex min-w-max items-center gap-3">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = index < activeIndex;

          return (
            <li key={step.id} className="flex items-center gap-3">
              <div
                className={[
                  "flex items-center gap-2 border px-3 py-2 transition",
                  isActive
                    ? "border-cyan-200/40 bg-cyan-300/[0.075] text-cyan-50"
                    : isComplete
                      ? "border-white/10 bg-white/[0.025] text-zinc-300"
                      : "border-white/10 bg-transparent text-zinc-600",
                ].join(" ")}
              >
                <span className="text-[11px] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-xs font-medium uppercase tracking-[0.18em]">{step.label}</span>
                <span className="text-xs text-current/70">{step.caption}</span>
              </div>
              {index < steps.length - 1 ? <span className="h-px w-5 bg-white/10" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

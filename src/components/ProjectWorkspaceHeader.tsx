"use client";

import type { ReactNode } from "react";
import type { DirectionInput, DirectionResult, SavedDirectionResult } from "@/lib/types";

interface ProjectWorkspaceHeaderProps {
  activeProject?: SavedDirectionResult | null;
  result: DirectionResult;
  input: DirectionInput;
  saved: boolean;
  edited: boolean;
  autosavedAt?: string;
  onBackToArchive: () => void;
  onExport: () => void;
  onToggleFavorite?: (id: string) => void;
}

function formatTime(value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function meta(label: string, value?: string) {
  if (!value) return null;

  return (
    <span className="min-w-0 text-xs text-zinc-500">
      <span className="text-zinc-600">{label}</span> <span className="break-words text-zinc-300">{value}</span>
    </span>
  );
}

export function ProjectWorkspaceHeader({
  activeProject,
  result,
  input,
  saved,
  edited,
  autosavedAt,
  onBackToArchive,
  onExport,
  onToggleFavorite,
}: ProjectWorkspaceHeaderProps) {
  const title = activeProject?.title || result.recommended_direction.title || "Untitled Direction";
  const sourceLabel = activeProject ? "Archive project" : "Current draft";
  const statusLabel = activeProject
    ? saved
      ? "Archive saved"
      : edited
        ? "Editing archived project"
        : "Restored from Archive"
    : "Autosaved draft";
  const providerLabel = result.ai_mode === "live" ? [result.ai_provider, result.ai_model].filter(Boolean).join(" / ") : "Demo";
  const updatedAt = activeProject?.updatedAt || autosavedAt || result.createdAt;

  return (
    <section className="min-w-0 rounded-[26px] bg-black/20 px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055),0_18px_80px_rgba(0,0,0,0.16)] sm:px-5">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/60">
              {sourceLabel}
            </span>
            <span className="text-zinc-700">/</span>
            <span className="text-xs text-zinc-500">{statusLabel}</span>
            {activeProject ? (
              <button
                type="button"
                onClick={() => onToggleFavorite?.(activeProject.id)}
                className={[
                  "px-1 text-xs transition",
                  activeProject.favorite
                    ? "text-amber-100"
                    : "text-zinc-500 hover:text-zinc-200",
                ].join(" ")}
              >
                {activeProject.favorite ? "Favorited" : "Favorite"}
              </button>
            ) : null}
          </div>

          <h2 className="mt-3 max-w-5xl break-words text-2xl font-semibold leading-tight text-zinc-50 md:text-4xl">
            {title}
          </h2>

          <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-2">
            {meta("Type", input.projectType)}
            {meta("Goal", input.outputGoal)}
            {meta("AI", providerLabel)}
            {meta("Mode", result.ai_mode === "live" ? "Live" : "Demo")}
            {meta("Updated", formatTime(updatedAt))}
          </div>

          <p className="mt-2 max-w-4xl text-xs leading-6 text-zinc-600">
            {activeProject ? "保存会更新当前归档记录，autosave 只作为恢复点。" : "当前结果已进入 Current Draft，需要长期保留时保存到 Archive。"}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 xl:pt-1">
          <HeaderButton onClick={onBackToArchive}>Back to Archive</HeaderButton>
          <HeaderButton onClick={onExport} accent>
            Export
          </HeaderButton>
        </div>
      </div>
    </section>
  );
}

function HeaderButton({
  children,
  accent = false,
  onClick,
}: {
  children: ReactNode;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-w-0 rounded-[12px] border px-3.5 py-2 text-xs transition",
        accent
          ? "border-cyan-100/25 bg-cyan-300/[0.08] text-cyan-50 hover:bg-cyan-300/[0.14]"
          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

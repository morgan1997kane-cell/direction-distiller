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
    <span className="min-w-0 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-xs text-zinc-400">
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
    <section className="min-w-0 border-y border-white/10 py-5">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-100/20 bg-cyan-300/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/75">
              {sourceLabel}
            </span>
            <span className="text-xs text-zinc-500">{statusLabel}</span>
            {activeProject ? (
              <button
                type="button"
                onClick={() => onToggleFavorite?.(activeProject.id)}
                className={[
                  "rounded-full border px-3 py-1 text-xs transition",
                  activeProject.favorite
                    ? "border-amber-200/35 bg-amber-200/[0.08] text-amber-100"
                    : "border-white/10 bg-white/[0.02] text-zinc-500 hover:text-zinc-200",
                ].join(" ")}
              >
                {activeProject.favorite ? "Favorited" : "Favorite"}
              </button>
            ) : null}
          </div>

          <h2 className="mt-4 max-w-5xl break-words text-3xl font-semibold leading-tight text-zinc-50 md:text-5xl">
            {title}
          </h2>

          <div className="mt-4 flex min-w-0 flex-wrap gap-2">
            {meta("Type", input.projectType)}
            {meta("Goal", input.outputGoal)}
            {meta("AI", providerLabel)}
            {meta("Mode", result.ai_mode === "live" ? "Live" : "Demo")}
            {meta("Updated", formatTime(updatedAt))}
          </div>

          {activeProject ? (
            <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-500">
              正在继续编辑 Archive 中的项目；保存会更新这个归档记录，autosave 仍只作为当前草稿恢复点。
            </p>
          ) : (
            <p className="mt-3 max-w-4xl text-sm leading-7 text-zinc-500">
              当前结果会自动保存为 Current Draft；需要长期保留时请保存到 Project Archive。
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
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
        "min-w-0 border px-4 py-2.5 text-sm transition",
        accent
          ? "border-cyan-100/25 bg-cyan-300/[0.08] text-cyan-50 hover:bg-cyan-300/[0.14]"
          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

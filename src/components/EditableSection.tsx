"use client";

import { useState } from "react";
import { copyText } from "@/lib/copy";

interface EditRenderProps<T> {
  value: T;
  onCancel: () => void;
  onSave: (value: T) => void;
}

interface EditableSectionProps<T> {
  title: string;
  label?: string;
  description?: string;
  summary?: React.ReactNode;
  defaultExpanded?: boolean;
  presentation?: "default" | "card" | "stage";
  value: T;
  copyTextValue?: string;
  isRegenerating?: boolean;
  onSave: (value: T) => void;
  onRegenerate: (instruction: string) => Promise<void> | void;
  renderEditor: (props: EditRenderProps<T>) => React.ReactNode;
  children: React.ReactNode;
}

export function EditableSection<T>({
  title,
  label,
  description,
  summary,
  defaultExpanded = true,
  presentation = "default",
  value,
  copyTextValue,
  isRegenerating = false,
  onSave,
  onRegenerate,
  renderEditor,
  children,
}: EditableSectionProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [showInstruction, setShowInstruction] = useState(false);
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  function startEditing() {
    setMessage("");
    setIsExpanded(true);
    setIsEditing(true);
  }

  function saveEdit(nextValue: T) {
    onSave(nextValue);
    setMessage("已保存");
    setIsEditing(false);
  }

  async function copySection() {
    await copyText(copyTextValue ?? "");
    setMessage("已复制");
    window.setTimeout(() => setMessage(""), 1200);
  }

  async function submitRegenerate() {
    setMessage("");
    await onRegenerate(instruction);
    setInstruction("");
    setShowInstruction(false);
  }

  const cardMode = presentation === "card";
  const stageMode = presentation === "stage";

  return (
    <section
      className={
        cardMode
          ? "flex h-full min-w-0 flex-col"
          : stageMode
            ? "min-w-0"
            : "min-w-0 border-t border-white/[0.08] px-0 py-7 md:py-8"
      }
    >
      <div
        className={
          cardMode || stageMode
            ? "mb-3 flex flex-wrap items-center justify-end gap-1.5"
            : "flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        }
      >
        {!cardMode && !stageMode ? (
          <div className="min-w-0">
            {label ? <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/30">{label}</p> : null}
            <h3 className="mt-2 text-2xl font-semibold leading-snug text-zinc-50 md:text-3xl">{title}</h3>
            {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">{description}</p> : null}
          </div>
        ) : null}
        <div className={stageMode ? "flex shrink-0 flex-wrap items-center gap-1.5 pr-1" : "flex shrink-0 flex-wrap items-center gap-1.5"}>
          {message ? <span className="text-xs text-cyan-100/70">{message}</span> : null}
          <SectionButton onClick={startEditing}>Edit</SectionButton>
          <SectionButton onClick={() => setShowInstruction((current) => !current)} disabled={isRegenerating}>
            {isRegenerating ? "Regenerating" : "Regenerate"}
          </SectionButton>
          <SectionButton onClick={copySection}>Copy</SectionButton>
          <SectionButton onClick={() => setIsExpanded((current) => !current)} ariaExpanded={isExpanded}>
            {isExpanded ? "Collapse" : "Expand"}
          </SectionButton>
        </div>
      </div>

      {!isExpanded && !isEditing ? (
        <div className="mt-5 border-l border-white/10 pl-4 text-sm leading-7 text-zinc-500">
          {summary ?? <span className="text-zinc-500">已折叠，展开查看完整内容。</span>}
        </div>
      ) : null}

      {showInstruction && isExpanded ? (
        <div className="mt-5 flex flex-col gap-3 border-y border-white/10 py-4 md:flex-row">
          <input
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="补充本次重生成指令，例如：更商业一点、更偏黑白高反差"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <button
            type="button"
            onClick={submitRegenerate}
            disabled={isRegenerating}
            className="border border-cyan-200/15 bg-cyan-300/[0.045] px-4 py-2 text-xs text-cyan-50 transition hover:bg-cyan-300/[0.1] disabled:opacity-50"
          >
            开始局部重生成
          </button>
        </div>
      ) : null}

      {isEditing ? (
        <div className="mt-6">{renderEditor({ value, onCancel: () => setIsEditing(false), onSave: saveEdit })}</div>
      ) : isExpanded ? (
        <div className={cardMode ? "min-w-0 flex-1" : stageMode ? "min-w-0" : "mt-6 min-w-0"}>{children}</div>
      ) : null}
    </section>
  );
}

export function CollapsibleSection({
  title,
  label,
  description,
  summary,
  defaultExpanded = true,
  children,
}: {
  title: string;
  label?: string;
  description?: string;
  summary?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="min-w-0 border-t border-white/[0.08] px-0 py-7 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {label ? <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/30">{label}</p> : null}
          <h3 className="mt-2 text-2xl font-semibold leading-snug text-zinc-50 md:text-3xl">{title}</h3>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">{description}</p> : null}
        </div>
        <SectionButton onClick={() => setIsExpanded((current) => !current)} ariaExpanded={isExpanded}>
          {isExpanded ? "Collapse" : "Expand"}
        </SectionButton>
      </div>

      {!isExpanded ? (
        <div className="mt-5 border-l border-white/10 pl-4 text-sm leading-7 text-zinc-500">
          {summary ?? <span className="text-zinc-500">已折叠，展开查看完整内容。</span>}
        </div>
      ) : (
        <div className="mt-6 min-w-0">{children}</div>
      )}
    </section>
  );
}

function SectionButton({
  children,
  disabled = false,
  ariaExpanded,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  ariaExpanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      className="px-2.5 py-1.5 text-xs text-zinc-500 transition hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

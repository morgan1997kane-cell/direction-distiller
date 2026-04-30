"use client";

import { useMemo, useState } from "react";
import { copyText } from "@/lib/copy";

interface EditableSectionProps<T> {
  title: string;
  label?: string;
  value: T;
  copyTextValue?: string;
  isRegenerating?: boolean;
  onSave: (value: T) => void;
  onRegenerate: (instruction: string) => Promise<void> | void;
  children: React.ReactNode;
}

export function EditableSection<T>({
  title,
  label,
  value,
  copyTextValue,
  isRegenerating = false,
  onSave,
  onRegenerate,
  children,
}: EditableSectionProps<T>) {
  const serialized = useMemo(() => JSON.stringify(value, null, 2), [value]);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(serialized);
  const [instruction, setInstruction] = useState("");
  const [showInstruction, setShowInstruction] = useState(false);
  const [message, setMessage] = useState("");

  function startEditing() {
    setDraft(serialized);
    setMessage("");
    setIsEditing(true);
  }

  function saveDraft() {
    try {
      onSave(JSON.parse(draft) as T);
      setMessage("已保存");
      setIsEditing(false);
    } catch {
      setMessage("JSON 格式有误，请检查后再保存。");
    }
  }

  async function copySection() {
    await copyText(copyTextValue ?? serialized);
    setMessage("已复制");
    window.setTimeout(() => setMessage(""), 1200);
  }

  async function submitRegenerate() {
    setMessage("");
    await onRegenerate(instruction);
    setInstruction("");
    setShowInstruction(false);
  }

  return (
    <section className="border border-white/10 bg-white/[0.018] p-3 md:p-4">
      <div className="mb-3 flex flex-col gap-3 border-b border-white/10 pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          {label ? <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/40">{label}</p> : null}
          <h3 className="mt-1 text-sm font-medium text-zinc-100">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {message ? <span className="text-xs text-cyan-100/70">{message}</span> : null}
          <SectionButton onClick={startEditing}>Edit</SectionButton>
          <SectionButton onClick={() => setShowInstruction((current) => !current)} disabled={isRegenerating}>
            {isRegenerating ? "Regenerating" : "Regenerate"}
          </SectionButton>
          <SectionButton onClick={copySection}>Copy</SectionButton>
        </div>
      </div>

      {showInstruction ? (
        <div className="mb-3 flex flex-col gap-2 border border-white/10 bg-black/30 p-3 md:flex-row">
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
            className="border border-cyan-200/30 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-50 transition hover:bg-cyan-300/15 disabled:opacity-50"
          >
            开始局部重生成
          </button>
        </div>
      ) : null}

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-64 w-full resize-y border border-white/10 bg-black/45 p-3 font-mono text-xs leading-6 text-zinc-200 outline-none focus:border-cyan-200/30"
          />
          <div className="flex flex-wrap gap-2">
            <SectionButton onClick={saveDraft}>Save</SectionButton>
            <SectionButton onClick={() => setIsEditing(false)}>Cancel</SectionButton>
          </div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function SectionButton({
  children,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-zinc-400 transition hover:border-cyan-200/30 hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

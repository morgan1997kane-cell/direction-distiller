"use client";

import { useState } from "react";
import type { DirectionResult } from "@/lib/types";
import {
  copyClientExport,
  copyInternalExport,
  copyMarkdownExport,
  formatMarkdownExport,
  getMarkdownExportFilename,
} from "@/lib/exportResult";

interface ExportPanelProps {
  result: DirectionResult;
  onExport?: () => void;
}

export function ExportPanel({ result, onExport }: ExportPanelProps) {
  const [notice, setNotice] = useState("");

  async function run(label: string, action: () => Promise<void> | void) {
    await action();
    onExport?.();
    setNotice(label);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function downloadMarkdown() {
    const markdown = formatMarkdownExport(result);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getMarkdownExportFilename(result);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <section className="border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/45">Export</p>
          <h3 className="mt-1 text-base font-medium text-zinc-100">导出方向包</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">复制或下载当前结果，不会改动草稿、历史记录或生成内容。</p>
        </div>
        {notice ? <p className="text-xs text-cyan-100/80">{notice}</p> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ExportButton onClick={() => run("已复制 Markdown", () => copyMarkdownExport(result))}>复制 Markdown</ExportButton>
        <ExportButton onClick={() => run("已下载 .md", downloadMarkdown)}>下载 .md</ExportButton>
        <ExportButton onClick={() => run("已复制客户版", () => copyClientExport(result))}>复制客户版</ExportButton>
        <ExportButton onClick={() => run("已复制内部执行版", () => copyInternalExport(result))}>复制内部版</ExportButton>
      </div>
    </section>
  );
}

function ExportButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-white/10 bg-black/25 px-3 py-2 text-sm text-zinc-300 transition hover:border-cyan-200/40 hover:bg-cyan-300/10 hover:text-cyan-50"
    >
      {children}
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";
import { copyMarkdownExport } from "@/lib/exportResult";
import type { SavedDirectionResult } from "@/lib/types";

type ArchiveFilter = "all" | "favorite" | "live" | "demo";

interface HistoryPanelProps {
  items: SavedDirectionResult[];
  onRestore: (item: SavedDirectionResult) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onRename: (id: string, title: string) => void;
  onToggleFavorite: (id: string) => void;
}

const filters: { value: ArchiveFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "favorite", label: "收藏" },
  { value: "live", label: "Live" },
  { value: "demo", label: "Demo" },
];

export function HistoryPanel({ items, onRestore, onDelete, onClear, onRename, onToggleFavorite }: HistoryPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ArchiveFilter>("all");
  const [editingId, setEditingId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [notice, setNotice] = useState("");

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "favorite" && item.favorite) ||
        (filter === "live" && item.aiMode === "live") ||
        (filter === "demo" && item.aiMode === "demo");

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [item.title, item.brief, item.projectType, item.recommendedTitle]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [filter, items, query]);

  function startRename(item: SavedDirectionResult) {
    setEditingId(item.id);
    setEditingTitle(item.title);
  }

  function saveRename(id: string) {
    onRename(id, editingTitle);
    setEditingId("");
    setEditingTitle("");
  }

  async function copyMarkdown(item: SavedDirectionResult) {
    await copyMarkdownExport(item.result);
    setNotice("已复制 Markdown");
    window.setTimeout(() => setNotice(""), 1600);
  }

  function confirmDelete(id: string) {
    if (window.confirm("确定删除这条归档记录吗？")) onDelete(id);
  }

  function confirmClear() {
    if (window.confirm("确定清空全部 Project Archive 吗？")) onClear();
  }

  return (
    <aside className="border border-white/10 bg-zinc-950/75 p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">Project Archive</p>
          <h2 className="mt-1 text-lg font-medium text-zinc-100">方向归档</h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">主动保存的方向包会进入项目库；自动草稿仍只保留最近一次。</p>
        </div>
        {items.length > 0 ? (
          <button type="button" onClick={confirmClear} className="text-xs text-zinc-500 transition hover:text-red-200">
            清空
          </button>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、brief、项目类型..."
          className="w-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-200/40"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={[
                "border px-2.5 py-1 text-xs transition",
                filter === item.value
                  ? "border-cyan-200/40 bg-cyan-300/10 text-cyan-50"
                  : "border-white/10 bg-white/[0.03] text-zinc-500 hover:text-zinc-200",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {notice ? <p className="mt-3 text-xs text-cyan-100/80">{notice}</p> : null}

      {items.length === 0 ? (
        <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-zinc-500">
          保存后的方向包会出现在这里，仅存储在本地浏览器。
        </p>
      ) : visibleItems.length === 0 ? (
        <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-zinc-500">没有匹配的归档项目。</p>
      ) : (
        <div className="mt-5 space-y-3">
          {visibleItems.map((item) => (
            <article key={item.id} className="border border-white/10 bg-black/25 p-3 transition hover:border-cyan-200/20">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="min-w-0 flex-1 border border-white/10 bg-black/40 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-cyan-200/40"
                      />
                      <button type="button" onClick={() => saveRename(item.id)} className="text-xs text-cyan-100">
                        保存
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => onRestore(item)} className="block w-full text-left">
                      <p className="line-clamp-2 text-sm font-medium leading-6 text-zinc-100">
                        {item.favorite ? "★ " : ""}
                        {item.title}
                      </p>
                    </button>
                  )}
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{item.brief || item.result.input_summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  className={["shrink-0 text-sm transition", item.favorite ? "text-cyan-100" : "text-zinc-600 hover:text-zinc-300"].join(" ")}
                  aria-label={item.favorite ? "取消收藏" : "收藏"}
                >
                  ★
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-zinc-500">
                <ArchiveTag>{item.projectType}</ArchiveTag>
                <ArchiveTag>{item.aiMode === "live" ? "Live" : "Demo"}</ArchiveTag>
                {item.provider ? <ArchiveTag>{item.provider}</ArchiveTag> : null}
                {item.model ? <ArchiveTag>{item.model}</ArchiveTag> : null}
              </div>

              <p className="mt-3 text-[11px] text-zinc-600">
                更新于 {new Date(item.updatedAt).toLocaleString("zh-CN", { hour12: false })} · 推荐：{item.recommendedTitle}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                <ArchiveAction onClick={() => onRestore(item)}>打开</ArchiveAction>
                <ArchiveAction onClick={() => startRename(item)}>重命名</ArchiveAction>
                <ArchiveAction onClick={() => copyMarkdown(item)}>复制 Markdown</ArchiveAction>
                <ArchiveAction onClick={() => confirmDelete(item.id)} danger>
                  删除
                </ArchiveAction>
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}

function ArchiveTag({ children }: { children: React.ReactNode }) {
  return <span className="border border-white/10 bg-white/[0.03] px-2 py-1">{children}</span>;
}

function ArchiveAction({ children, onClick, danger = false }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={["text-xs transition", danger ? "text-zinc-600 hover:text-red-200" : "text-zinc-500 hover:text-cyan-100"].join(" ")}
    >
      {children}
    </button>
  );
}

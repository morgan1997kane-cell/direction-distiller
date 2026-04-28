"use client";

import type { SavedDirectionResult } from "@/lib/types";

interface HistoryPanelProps {
  items: SavedDirectionResult[];
  onRestore: (item: SavedDirectionResult) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ items, onRestore, onDelete, onClear }: HistoryPanelProps) {
  return (
    <aside className="border border-white/10 bg-zinc-950/75 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">Archive</p>
          <h2 className="mt-1 text-lg font-medium text-zinc-100">历史记录</h2>
        </div>
        {items.length > 0 ? (
          <button type="button" onClick={onClear} className="text-xs text-zinc-500 transition hover:text-red-200">
            清空
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="border-t border-white/10 pt-4 text-sm leading-6 text-zinc-500">
          保存后的方向包会出现在这里，仅存储在本地浏览器。
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border border-white/10 bg-black/25 p-3">
              <button type="button" onClick={() => onRestore(item)} className="block w-full text-left">
                <p className="line-clamp-2 text-sm font-medium leading-6 text-zinc-100">{item.title}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  {new Date(item.savedAt).toLocaleString("zh-CN")} · {item.projectType}
                </p>
                <p className="mt-2 text-xs text-cyan-100/70">推荐：{item.recommendedTitle}</p>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="mt-3 border-t border-white/10 pt-2 text-xs text-zinc-600 transition hover:text-red-200"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

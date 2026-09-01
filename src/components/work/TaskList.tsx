"use client";

import { useMemo, useState } from "react";

import { diffDays } from "@/lib/work/date";
import { TASK_CATEGORIES, Task } from "@/lib/work/types";
import { TaskItem } from "./TaskItem";

type Filter = "open" | "overdue" | "week" | "done" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "open", label: "未完了" },
  { id: "overdue", label: "期限切れ" },
  { id: "week", label: "今週" },
  { id: "done", label: "完了" },
  { id: "all", label: "すべて" },
];

type SortKey = "due" | "created" | "priority";

const PRIORITY_ORDER = { high: 0, mid: 1, low: 2 } as const;

export function TaskList({ tasks, today }: { tasks: Task[]; today: string }) {
  const [filter, setFilter] = useState<Filter>("open");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("due");
  const [keyword, setKeyword] = useState("");

  const visible = useMemo(() => {
    const query = keyword.trim();

    const filtered = tasks.filter((task) => {
      if (category !== "all" && task.category !== category) return false;
      if (query && !task.title.includes(query) && !task.detail.includes(query)) {
        return false;
      }

      const open = task.status === "todo" || task.status === "doing";
      const days = task.dueDate ? diffDays(task.dueDate, today) : null;

      switch (filter) {
        case "open":
          return open;
        case "overdue":
          return open && days !== null && days < 0;
        case "week":
          return open && days !== null && days >= 0 && days <= 7;
        case "done":
          return task.status === "done";
        case "all":
          return true;
      }
    });

    return filtered.sort((a, b) => {
      if (sort === "priority") {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (diff !== 0) return diff;
      }
      if (sort === "created") {
        return b.createdAt.localeCompare(a.createdAt);
      }
      // 期限順。期限なしは最後に回す
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, filter, category, sort, keyword, today]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <header className="space-y-3 border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">
            すべてのタスク
            <span className="ml-2 text-xs font-normal text-slate-400">
              {visible.length}件
            </span>
          </h2>

          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="キーワード検索"
            className="w-44 rounded-lg border border-slate-300 px-2.5 py-1 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === item.id
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-slate-200" />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="分類で絞り込む"
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-teal-500"
          >
            <option value="all">分類すべて</option>
            {TASK_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            aria-label="並び順"
            className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-teal-500"
          >
            <option value="due">期限が近い順</option>
            <option value="priority">優先度順</option>
            <option value="created">登録が新しい順</option>
          </select>
        </div>
      </header>

      <div className="space-y-2 p-3">
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            該当するタスクはありません。
          </p>
        ) : (
          visible.map((task) => (
            <TaskItem key={task.id} task={task} today={today} />
          ))
        )}
      </div>
    </section>
  );
}

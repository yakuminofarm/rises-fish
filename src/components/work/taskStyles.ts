// タスク表示の共通スタイル。サーバー・クライアント両方から使う。

import { NudgeKind, TaskPriority, TaskStatus } from "@/lib/work/types";

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "重要",
  mid: "通常",
  low: "後で",
};

export const PRIORITY_CLASS: Record<TaskPriority, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  mid: "bg-slate-50 text-slate-600 border-slate-200",
  low: "bg-slate-50 text-slate-400 border-slate-200",
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
  dropped: "見送り",
};

export const CATEGORY_CLASS: Record<string, string> = {
  世話: "bg-emerald-50 text-emerald-700 border-emerald-200",
  出荷: "bg-sky-50 text-sky-700 border-sky-200",
  仕入: "bg-amber-50 text-amber-700 border-amber-200",
  販促: "bg-violet-50 text-violet-700 border-violet-200",
  事務: "bg-slate-100 text-slate-600 border-slate-200",
  その他: "bg-slate-50 text-slate-500 border-slate-200",
};

export const NUDGE_STYLE: Record<
  NudgeKind,
  { label: string; className: string }
> = {
  overdue: { label: "期限超過", className: "bg-rose-500" },
  today: { label: "今日が期限", className: "bg-orange-500" },
  postponed: { label: "先送り常習", className: "bg-amber-500" },
  stale: { label: "放置中", className: "bg-slate-400" },
  nodue: { label: "期限未定", className: "bg-sky-500" },
};

/** 期限の切迫度に応じた文字色 */
export function dueClass(daysLeft: number | null): string {
  if (daysLeft === null) return "text-slate-400";
  if (daysLeft < 0) return "text-rose-600 font-semibold";
  if (daysLeft === 0) return "text-orange-600 font-semibold";
  if (daysLeft <= 2) return "text-amber-600";
  return "text-slate-500";
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

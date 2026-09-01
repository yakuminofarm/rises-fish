// 業務管理ツール（タスク秘書）の共通型定義。
// サーバー・クライアント両方から読むため、副作用のある import は置かないこと。

export type TaskStatus = "todo" | "doing" | "done" | "dropped";
export type TaskPriority = "high" | "mid" | "low";
export type TaskRepeat = "none" | "daily" | "weekly" | "monthly";

export const TASK_CATEGORIES = [
  "世話",
  "出荷",
  "仕入",
  "販促",
  "事務",
  "その他",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface Task {
  id: string;
  title: string;
  detail: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  /** YYYY-MM-DD（JST）。期限なしは null */
  dueDate: string | null;
  /** 見積り作業時間（分）。不明は null */
  estimateMin: number | null;
  repeat: TaskRepeat;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  /** manual = 手入力 / agent = AI秘書が起票 */
  source: "manual" | "agent";
  /** 「明日やる」で先送りされた回数。放置の検知に使う */
  postponeCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
  /** AI秘書がその発言で行った操作の要約（監査用） */
  actions: string[];
}

export interface WorkspaceData {
  version: 1;
  tasks: Task[];
  chat: ChatMessage[];
  settings: {
    /** 1日に充てられる作業時間（分）。今日の作戦の分量を決める */
    dailyCapacityMin: number;
  };
}

export function emptyWorkspace(): WorkspaceData {
  return {
    version: 1,
    tasks: [],
    chat: [],
    settings: { dailyCapacityMin: 240 },
  };
}

/** 今日の作戦の1件。理由つきで並べる */
export interface PlanItem {
  task: Task;
  score: number;
  reasons: string[];
}

export type NudgeKind = "overdue" | "today" | "stale" | "postponed" | "nodue";

export interface Nudge {
  kind: NudgeKind;
  taskId: string;
  title: string;
  message: string;
}

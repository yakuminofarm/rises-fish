import "server-only";

import { randomId } from "./crypto";
import { isValidYmd, todayJst } from "./date";
import { readWorkspace, updateWorkspace } from "./store";
import {
  ChatMessage,
  TASK_CATEGORIES,
  Task,
  TaskCategory,
  TaskPriority,
  TaskRepeat,
  TaskStatus,
  WorkspaceData,
} from "./types";

const MAX_TITLE = 120;
const MAX_DETAIL = 2000;
const MAX_TASKS = 2000;
const MAX_CHAT = 60;

// 改行・タブ以外の制御文字。保存前に必ず落とす
const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]",
  "g",
);

export interface TaskDraft {
  title: string;
  detail?: string | null;
  priority?: string | null;
  category?: string | null;
  dueDate?: string | null;
  estimateMin?: number | null;
  repeat?: string | null;
}

/** 1行テキスト用。制御文字を落とし、改行は空白に潰す */
function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(CONTROL_CHARS, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);
}

/** 複数行テキスト用。改行は残す */
function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim().slice(0, max);
}

function toPriority(value: unknown): TaskPriority {
  return value === "high" || value === "low" || value === "mid" ? value : "mid";
}

function toCategory(value: unknown): TaskCategory {
  return TASK_CATEGORIES.includes(value as TaskCategory)
    ? (value as TaskCategory)
    : "その他";
}

function toRepeat(value: unknown): TaskRepeat {
  return value === "daily" || value === "weekly" || value === "monthly"
    ? value
    : "none";
}

function toEstimate(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(Math.round(n), 24 * 60);
}

/** 外から来た下書き（AI 出力・フォーム入力）を Task に正規化する */
export function normalizeDraft(
  draft: TaskDraft,
  source: Task["source"],
): Task | null {
  const title = cleanLine(draft.title, MAX_TITLE);
  if (!title) return null;

  const now = new Date().toISOString();
  return {
    id: randomId(9),
    title,
    detail: cleanText(draft.detail, MAX_DETAIL),
    status: "todo",
    priority: toPriority(draft.priority),
    category: toCategory(draft.category),
    dueDate: isValidYmd(draft.dueDate) ? draft.dueDate : null,
    estimateMin: toEstimate(draft.estimateMin),
    repeat: toRepeat(draft.repeat),
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    source,
    postponeCount: 0,
  };
}

export async function getWorkspace(userId: string): Promise<WorkspaceData> {
  return readWorkspace(userId);
}

export async function addTasks(
  userId: string,
  drafts: TaskDraft[],
  source: Task["source"],
): Promise<Task[]> {
  const created: Task[] = [];
  await updateWorkspace(userId, (data) => {
    for (const draft of drafts) {
      if (data.tasks.length >= MAX_TASKS) break;
      const task = normalizeDraft(draft, source);
      if (!task) continue;
      data.tasks.push(task);
      created.push(task);
    }
  });
  return created;
}

export interface TaskPatch {
  title?: string;
  detail?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string | null;
  estimateMin?: number | null;
  repeat?: TaskRepeat;
}

export async function patchTask(
  userId: string,
  taskId: string,
  patch: TaskPatch,
): Promise<Task | null> {
  let updated: Task | null = null;

  await updateWorkspace(userId, (data) => {
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (patch.title !== undefined) {
      const title = cleanLine(patch.title, MAX_TITLE);
      if (title) task.title = title;
    }
    if (patch.detail !== undefined) {
      task.detail = cleanText(patch.detail, MAX_DETAIL);
    }
    if (patch.priority !== undefined) task.priority = toPriority(patch.priority);
    if (patch.category !== undefined) task.category = toCategory(patch.category);
    if (patch.repeat !== undefined) task.repeat = toRepeat(patch.repeat);
    if (patch.estimateMin !== undefined) {
      task.estimateMin = toEstimate(patch.estimateMin);
    }
    if (patch.dueDate !== undefined) {
      // 期限を先に倒したら「先送り」として数える
      const next = isValidYmd(patch.dueDate) ? patch.dueDate : null;
      if (task.dueDate && next && next > task.dueDate) {
        task.postponeCount += 1;
      }
      task.dueDate = next;
    }
    if (patch.status !== undefined) {
      task.status = patch.status;
      task.completedAt =
        patch.status === "done" ? new Date().toISOString() : null;
    }

    task.updatedAt = new Date().toISOString();
    updated = task;
  });

  return updated;
}

export async function removeTask(
  userId: string,
  taskId: string,
): Promise<boolean> {
  let removed = false;
  await updateWorkspace(userId, (data) => {
    const before = data.tasks.length;
    data.tasks = data.tasks.filter((t) => t.id !== taskId);
    removed = data.tasks.length < before;
  });
  return removed;
}

/**
 * 完了にする。繰り返し設定があれば次回分を自動で起票する。
 * （毎日の水換えのようなものを、覚えていなくても回るようにする）
 */
export async function completeTask(
  userId: string,
  taskId: string,
): Promise<Task | null> {
  let done: Task | null = null;

  await updateWorkspace(userId, (data) => {
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const now = new Date().toISOString();
    task.status = "done";
    task.completedAt = now;
    task.updatedAt = now;
    done = task;

    if (task.repeat !== "none" && data.tasks.length < MAX_TASKS) {
      const base = task.dueDate ?? todayJst();
      data.tasks.push({
        ...task,
        id: randomId(9),
        status: "todo",
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        postponeCount: 0,
        dueDate: nextOccurrence(base, task.repeat),
      });
    }
  });

  return done;
}

function nextOccurrence(ymd: string, repeat: TaskRepeat): string {
  const date = new Date(`${ymd}T00:00:00+09:00`);
  if (repeat === "daily") date.setUTCDate(date.getUTCDate() + 1);
  else if (repeat === "weekly") date.setUTCDate(date.getUTCDate() + 7);
  else if (repeat === "monthly") date.setUTCMonth(date.getUTCMonth() + 1);
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export async function appendChat(
  userId: string,
  message: Omit<ChatMessage, "id" | "at">,
): Promise<void> {
  await updateWorkspace(userId, (data) => {
    data.chat.push({
      ...message,
      id: randomId(8),
      at: new Date().toISOString(),
    });
    // 履歴は直近ぶんだけ保持する（保存量とプロンプト量の両方を抑える）
    if (data.chat.length > MAX_CHAT) {
      data.chat = data.chat.slice(-MAX_CHAT);
    }
  });
}

export async function clearChat(userId: string): Promise<void> {
  await updateWorkspace(userId, (data) => {
    data.chat = [];
  });
}

export async function setCapacity(
  userId: string,
  minutes: number,
): Promise<void> {
  const clamped = Math.min(Math.max(Math.round(minutes), 30), 12 * 60);
  await updateWorkspace(userId, (data) => {
    data.settings.dailyCapacityMin = clamped;
  });
}

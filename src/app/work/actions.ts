"use server";

import { refresh } from "next/cache";

import { runAgent } from "@/lib/work/agent";
import { requireSessionForAction } from "@/lib/work/dal";
import { addDays, isValidYmd, todayJst } from "@/lib/work/date";
import {
  TaskPatch,
  addTasks,
  appendChat,
  clearChat,
  completeTask,
  getWorkspace,
  patchTask,
  removeTask,
  setCapacity,
} from "@/lib/work/tasks";
import { TaskStatus } from "@/lib/work/types";

// Server Action は UI を経由せず直接 POST できる。
// どの関数も先頭で requireSessionForAction() を通すこと。

const MAX_MESSAGE_LEN = 4000;

export interface AgentActionState {
  error: string | null;
}

export async function askAgent(
  _prev: AgentActionState,
  formData: FormData,
): Promise<AgentActionState> {
  const { userId } = await requireSessionForAction();

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "内容を入力してください。" };
  if (message.length > MAX_MESSAGE_LEN) {
    return { error: "長すぎます。4000文字以内に分けて送ってください。" };
  }

  const { chat } = await getWorkspace(userId);
  await appendChat(userId, { role: "user", text: message, actions: [] });

  const reply = await runAgent(userId, message, chat);
  await appendChat(userId, {
    role: "assistant",
    text: reply.text,
    actions: reply.actions,
  });

  // 応答は会話ログとして保存済み。再取得させて画面に反映する
  refresh();
  return { error: null };
}

export async function resetChat(): Promise<void> {
  const { userId } = await requireSessionForAction();
  await clearChat(userId);
  refresh();
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const { userId } = await requireSessionForAction();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const dueRaw = String(formData.get("dueDate") ?? "");
  const estimateRaw = String(formData.get("estimateMin") ?? "");

  await addTasks(
    userId,
    [
      {
        title,
        detail: String(formData.get("detail") ?? ""),
        priority: String(formData.get("priority") ?? "mid"),
        category: String(formData.get("category") ?? "その他"),
        dueDate: isValidYmd(dueRaw) ? dueRaw : null,
        estimateMin: estimateRaw ? Number(estimateRaw) : null,
        repeat: String(formData.get("repeat") ?? "none"),
      },
    ],
    "manual",
  );

  refresh();
}

export async function completeTaskAction(taskId: string): Promise<void> {
  const { userId } = await requireSessionForAction();
  await completeTask(userId, taskId);
  refresh();
}

export async function updateTaskAction(
  taskId: string,
  patch: TaskPatch,
): Promise<void> {
  const { userId } = await requireSessionForAction();
  await patchTask(userId, taskId, patch);
  refresh();
}

export async function setStatusAction(
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  const { userId } = await requireSessionForAction();
  await patchTask(userId, taskId, { status });
  refresh();
}

/** 「明日にする」。先送り回数が増えるので、放置の検知に効く */
export async function postponeAction(
  taskId: string,
  days = 1,
): Promise<void> {
  const { userId } = await requireSessionForAction();
  const { tasks } = await getWorkspace(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const base = task.dueDate ?? todayJst();
  await patchTask(userId, taskId, { dueDate: addDays(base, days) });
  refresh();
}

export async function deleteTaskAction(taskId: string): Promise<void> {
  const { userId } = await requireSessionForAction();
  await removeTask(userId, taskId);
  refresh();
}

export async function setCapacityAction(minutes: number): Promise<void> {
  const { userId } = await requireSessionForAction();
  await setCapacity(userId, minutes);
  refresh();
}

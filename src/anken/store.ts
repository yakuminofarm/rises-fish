"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, maxISO, todayISO } from "./date";
import { buildSample, CURRENT_USER_ID, type SampleData } from "./sample";
import { TEMPLATES } from "./templates";
import type {
  Activity,
  Category,
  HomeVariant,
  Party,
  Priority,
  Project,
  Request,
  Task,
  TaskStatus,
} from "./types";

const newId = (prefix: string) =>
  prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

const nowStamp = () => {
  const d = new Date();
  return `${todayISO()}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
};

export const partyLabel = (p?: Party) =>
  !p ? "不明" : p.kind === "member" ? p.name : `${p.org} ${p.name}さん`;

export interface NewProjectInput {
  title: string;
  category: Category;
  ownerId: string;
  clientId?: string;
  vendorId?: string;
  due: string;
  priority: Priority;
  useTemplate: boolean;
  requestId?: string;
}

export interface ImportRow {
  title: string;
  due: string;
  assigneeId: string;
}

interface AnkenState extends SampleData {
  currentUserId: string;
  homeVariant: HomeVariant;

  setHomeVariant: (v: HomeVariant) => void;

  addRequest: (r: Omit<Request, "id" | "receivedAt" | "state">) => void;
  setRequestState: (id: string, state: Request["state"]) => void;

  createProject: (input: NewProjectInput) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;

  addTask: (t: Pick<Task, "projectId" | "title" | "assigneeId" | "due"> & Partial<Task>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  /** 状態を変える。待ちへ移すときは ballId（相手先）が必要 */
  moveTask: (id: string, status: TaskStatus, ballId?: string) => void;
  /** ボールを渡す。相手先なら待ちに、課内メンバーなら進行中に */
  passBall: (id: string, toId: string, actorId?: string) => void;

  addComment: (projectId: string, text: string, actorId?: string) => void;

  importTasks: (projectTitle: string, category: Category, rows: ImportRow[]) => string;
  updateParty: (id: string, patch: Partial<Party>) => void;
  addParty: (p: Omit<Party, "id">) => void;
  resetSample: () => void;
}

export const useAnken = create<AnkenState>()(
  persist(
    (set, get) => {
      const log = (projectId: string, text: string, actorId = "system", taskId?: string): Activity => ({
        id: newId("a"),
        projectId,
        taskId,
        at: nowStamp(),
        actorId,
        text,
      });
      const party = (id: string) => get().parties.find((p) => p.id === id);

      return {
        ...buildSample(),
        currentUserId: CURRENT_USER_ID,
        homeVariant: "A",

        setHomeVariant: (homeVariant) => set({ homeVariant }),

        addRequest: (r) =>
          set((s) => ({
            requests: [{ ...r, id: newId("r"), receivedAt: nowStamp(), state: "new" }, ...s.requests],
          })),

        setRequestState: (id, state) =>
          set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, state } : r)) })),

        createProject: (input) => {
          const today = todayISO();
          const id = newId("p");
          const project: Project = {
            id,
            title: input.title,
            category: input.category,
            ownerId: input.ownerId,
            clientId: input.clientId,
            vendorId: input.vendorId,
            due: input.due,
            priority: input.priority,
            createdAt: today,
            done: false,
            requestId: input.requestId,
          };
          const tasks: Task[] = [];
          if (input.useTemplate) {
            // 納期から逆算して各工程の期日を決める。過去になる工程は今日に寄せる
            let prev = today;
            TEMPLATES[input.category].forEach((step, i) => {
              const due = maxISO(prev, addDays(input.due, -step.before));
              tasks.push({
                id: newId("t"),
                projectId: id,
                title: step.name,
                step: step.name,
                side: step.side,
                assigneeId: input.ownerId,
                ballId: input.ownerId,
                ballSince: today,
                start: prev,
                due,
                status: "todo",
                order: i,
              });
              prev = due;
            });
          }
          set((s) => ({
            projects: [...s.projects, project],
            tasks: [...s.tasks, ...tasks],
            requests: input.requestId
              ? s.requests.map((r) => (r.id === input.requestId ? { ...r, state: "converted", projectId: id } : r))
              : s.requests,
            activities: [...s.activities, log(id, "案件を作成しました", s.currentUserId)],
          }));
          return id;
        },

        updateProject: (id, patch) =>
          set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

        addTask: (t) =>
          set((s) => {
            const order = Math.max(0, ...s.tasks.filter((x) => x.projectId === t.projectId).map((x) => x.order)) + 1;
            const today = todayISO();
            const task: Task = {
              id: newId("t"),
              side: "us",
              ballId: t.assigneeId,
              ballSince: today,
              start: today < t.due ? today : t.due,
              status: "todo",
              order,
              ...t,
            };
            return { tasks: [...s.tasks, task] };
          }),

        updateTask: (id, patch) =>
          set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

        deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

        moveTask: (id, status, ballId) => {
          const task = get().tasks.find((t) => t.id === id);
          if (!task || task.status === status) return;
          if (status === "waiting") {
            if (ballId) get().passBall(id, ballId);
            return;
          }
          const today = todayISO();
          const backToUs = task.status === "waiting";
          const patch: Partial<Task> = {
            status,
            doneAt: status === "done" ? today : undefined,
            ...(backToUs ? { ballId: task.assigneeId, ballSince: today } : {}),
          };
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
            activities:
              status === "done"
                ? [...s.activities, log(task.projectId, `「${task.title}」が完了しました`, "system", id)]
                : s.activities,
          }));
        },

        passBall: (id, toId, actorId) => {
          const task = get().tasks.find((t) => t.id === id);
          const to = party(toId);
          if (!task || !to || task.ballId === toId) return;
          const from = party(task.ballId);
          const today = todayISO();
          const external = to.kind !== "member";
          const status: TaskStatus = external
            ? "waiting"
            : task.status === "waiting" || task.status === "todo"
              ? "doing"
              : task.status;
          set((s) => ({
            tasks: s.tasks.map((t) => (t.id === id ? { ...t, ballId: toId, ballSince: today, status } : t)),
            activities: [
              ...s.activities,
              log(
                task.projectId,
                `「${task.title}」のボールが ${partyLabel(from)} → ${partyLabel(to)} に移りました`,
                actorId ?? "system",
                id,
              ),
            ],
          }));
        },

        addComment: (projectId, text, actorId) =>
          set((s) => ({ activities: [...s.activities, log(projectId, text, actorId ?? s.currentUserId)] })),

        importTasks: (projectTitle, category, rows) => {
          const id = newId("p");
          const today = todayISO();
          const due = rows.reduce((m, r) => maxISO(m, r.due), today);
          set((s) => ({
            projects: [
              ...s.projects,
              { id, title: projectTitle, category, ownerId: s.currentUserId, due, priority: "neither", createdAt: today, done: false },
            ],
            tasks: [
              ...s.tasks,
              ...rows.map<Task>((r, i) => ({
                id: newId("t"),
                projectId: id,
                title: r.title,
                side: "us",
                assigneeId: r.assigneeId,
                ballId: r.assigneeId,
                ballSince: today,
                start: today < r.due ? today : r.due,
                due: r.due,
                status: "todo",
                order: i,
              })),
            ],
          }));
          return id;
        },

        updateParty: (id, patch) =>
          set((s) => ({ parties: s.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

        addParty: (p) => set((s) => ({ parties: [...s.parties, { ...p, id: newId(p.kind[0]) }] })),

        resetSample: () => set({ ...buildSample(), homeVariant: get().homeVariant }),
      };
    },
    {
      name: "anken-board-v1",
      // サーバー描画とずれないよう、読み込みは画面側で明示的に行う
      skipHydration: true,
      partialize: (s) => ({
        parties: s.parties,
        projects: s.projects,
        tasks: s.tasks,
        requests: s.requests,
        activities: s.activities,
        homeVariant: s.homeVariant,
      }),
    },
  ),
);

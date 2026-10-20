"use client";

import { Copy, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, fmtDateTime, todayISO } from "../date";
import { partyLabel, useAnken } from "../store";
import { PRIORITIES, STATUS_LABEL, TEMPLATES } from "../templates";
import type { Task } from "../types";
import {
  Avatar,
  BallMark,
  btn,
  CategoryChip,
  DueBadge,
  EmptyNote,
  inputCls,
  panelCls,
  PartySelect,
  SectionTitle,
  usePartyMap,
  useToast,
  WaitDays,
} from "../ui";

export function ProjectDetailView({ id }: { id: string }) {
  const project = useAnken((s) => s.projects.find((p) => p.id === id));
  const allTasks = useAnken((s) => s.tasks);
  const allActivities = useAnken((s) => s.activities);
  const updateProject = useAnken((s) => s.updateProject);
  const addComment = useAnken((s) => s.addComment);
  const parties = usePartyMap();
  const tasks = useMemo(
    () => allTasks.filter((t) => t.projectId === id).sort((a, b) => (a.due === b.due ? a.order - b.order : a.due < b.due ? -1 : 1)),
    [allTasks, id],
  );
  const activities = useMemo(
    () => allActivities.filter((a) => a.projectId === id).sort((a, b) => (a.at < b.at ? 1 : -1)),
    [allActivities, id],
  );
  const [comment, setComment] = useState("");

  if (!project) {
    return (
      <div className="mx-auto max-w-[640px] py-16 text-center">
        <p className="mb-4 text-ak-ink3">この案件は見つかりませんでした。</p>
        <Link href="/anken/projects" className={cn(btn.base, btn.secondary)}>
          案件一覧へ
        </Link>
      </div>
    );
  }

  // テンプレートの工程ごとに、終わったか・いまどこかを出す
  const steps = TEMPLATES[project.category]
    .map((s) => ({ ...s, tasks: tasks.filter((t) => t.step === s.name) }))
    .filter((s) => s.tasks.length > 0);
  const nowIdx = steps.findIndex((s) => s.tasks.some((t) => t.status !== "done"));
  const workers = Array.from(new Set(tasks.map((t) => t.assigneeId))).map((pid) => parties[pid]);
  const waitingTasks = tasks.filter((t) => t.status === "waiting");

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Link href="/anken/projects" className="text-[12px] text-ak-ink3 hover:underline">
            ← 案件一覧
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ak-ink3">
            <CategoryChip category={project.category} />
            <span>{PRIORITIES.find((p) => p.id === project.priority)?.label}</span>
            {project.done && <span className="rounded bg-ak-ok px-1.5 font-bold text-ak-sheet">完了</span>}
          </div>
          <h1 className="text-[20px] font-bold leading-snug">{project.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[12px] text-ak-ink3">
            納期
            <input
              id="pd-due"
              type="date"
              className={cn(inputCls, "w-auto py-1")}
              value={project.due}
              onChange={(e) => e.target.value && updateProject(project.id, { due: e.target.value })}
            />
          </label>
          <button
            type="button"
            className={cn(btn.base, project.done ? btn.ghost : btn.secondary)}
            onClick={() => updateProject(project.id, { done: !project.done })}
          >
            {project.done ? "進行中に戻す" : "案件を完了にする"}
          </button>
        </div>
      </div>

      {steps.length > 0 && (
        <section className={cn(panelCls, "overflow-x-auto px-4 py-3")} aria-label="工程">
          <ol className="flex min-w-[560px]">
            {steps.map((s, i) => {
              const state = nowIdx === -1 || i < nowIdx ? "done" : i === nowIdx ? "now" : "later";
              return (
                <li key={s.name} className="relative flex-1 pt-5 text-center text-[11.5px]">
                  {i > 0 && <span className="absolute left-[-50%] top-[9px] h-px w-full bg-ak-line" aria-hidden />}
                  <span
                    className={cn(
                      "absolute left-1/2 top-[3px] z-[1] h-3 w-3 -translate-x-1/2 rounded-full border-[1.5px]",
                      state === "done" && "border-ak-ink2 bg-ak-ink2",
                      state === "now" && "border-ak-ball bg-ak-ball ring-4 ring-ak-ball-soft",
                      state === "later" && "border-ak-ink3 bg-ak-sheet",
                    )}
                    aria-hidden
                  />
                  <span className={cn(state === "now" ? "font-bold text-ak-ink" : state === "done" ? "text-ak-ink2" : "text-ak-ink3")}>
                    {s.name}
                  </span>
                  {state === "now" && <span className="sr-only">（いまの工程）</span>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className={cn(panelCls, "p-4")}>
            <SectionTitle aside={`${tasks.filter((t) => t.status === "done").length}/${tasks.length} 完了`}>タスク</SectionTitle>
            {tasks.length === 0 && <EmptyNote>タスクはまだありません。下から追加できます。</EmptyNote>}
            {tasks.map((t) => (
              <DetailTaskRow key={t.id} task={t} />
            ))}
            <AddTaskForm projectId={project.id} defaultAssignee={project.ownerId} />
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section className={cn(panelCls, "p-4")}>
            <SectionTitle>関係者</SectionTitle>
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-[12.5px]">
              <span className="text-ak-ink3">責任者</span>
              <PartySelect id="pd-owner" value={project.ownerId} include={["member"]} onChange={(v) => updateProject(project.id, { ownerId: v })} />
              <span className="text-ak-ink3">作業</span>
              <span className="flex flex-wrap items-center gap-1.5">
                {workers.map((w) => (
                  <span key={w?.id} className="inline-flex items-center gap-1">
                    <Avatar party={w} size={18} />
                    {w?.name}
                  </span>
                ))}
              </span>
              <span className="text-ak-ink3">社内クライアント</span>
              <PartySelect
                id="pd-client"
                value={project.clientId ?? ""}
                include={["client"]}
                emptyLabel="なし"
                onChange={(v) => updateProject(project.id, { clientId: v || undefined })}
              />
              <span className="text-ak-ink3">外注先</span>
              <PartySelect
                id="pd-vendor"
                value={project.vendorId ?? ""}
                include={["vendor"]}
                emptyLabel="なし"
                onChange={(v) => updateProject(project.id, { vendorId: v || undefined })}
              />
            </div>
          </section>

          <section className={cn(panelCls, "p-4")}>
            <SectionTitle aside="ログイン不要">相手先の確認リンク</SectionTitle>
            {waitingTasks.length === 0 ? (
              <p className="text-[12.5px] text-ak-ink3">クライアント・外注先にボールを渡すと、ここに確認用のリンクが出ます。</p>
            ) : (
              <div className="flex flex-col gap-2">
                {waitingTasks.map((t) => (
                  <ReviewLink key={t.id} task={t} />
                ))}
              </div>
            )}
          </section>

          <section className={cn(panelCls, "bg-ak-wire p-4")}>
            <SectionTitle>やりとり</SectionTitle>
            <form
              className="mb-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                addComment(project.id, comment.trim());
                setComment("");
              }}
            >
              <input
                id="pd-comment"
                className={inputCls}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="コメント、またはChatwork・LINEのやりとりを貼り付け"
              />
              <button type="submit" className={cn(btn.base, btn.secondary)} disabled={!comment.trim()}>
                記録
              </button>
            </form>
            <ol className="flex flex-col gap-2.5">
              {activities.map((a) => {
                const actor = parties[a.actorId];
                return (
                  <li key={a.id} className="grid grid-cols-[22px_minmax(0,1fr)] gap-2 text-[12.5px]">
                    {a.actorId === "system" ? (
                      <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-ak-wire2 text-[10px] text-ak-ink3" aria-hidden>
                        ●
                      </span>
                    ) : (
                      <Avatar party={actor} />
                    )}
                    <div className="min-w-0">
                      <p className={cn("whitespace-pre-wrap", a.actorId === "system" && "text-ak-ink3")}>
                        {a.actorId !== "system" && <span className="mr-1 font-bold">{partyLabel(actor)}</span>}
                        {a.text}
                      </p>
                      <span className="tabular font-mono text-[10.5px] text-ak-ink3">{fmtDateTime(a.at)}</span>
                    </div>
                  </li>
                );
              })}
              {activities.length === 0 && <li className="text-[12.5px] text-ak-ink3">まだ記録はありません。</li>}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailTaskRow({ task }: { task: Task }) {
  const moveTask = useAnken((s) => s.moveTask);
  const passBall = useAnken((s) => s.passBall);
  const updateTask = useAnken((s) => s.updateTask);
  const deleteTask = useAnken((s) => s.deleteTask);
  const me = useAnken((s) => s.currentUserId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const done = task.status === "done";

  return (
    <div className="flex flex-col gap-1.5 border-t border-ak-wire2 py-2.5 first:border-t-0">
      <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2.5">
        <input
          type="checkbox"
          checked={done}
          onChange={() => moveTask(task.id, done ? "doing" : "done")}
          aria-label={`${task.title}を${done ? "未完了に戻す" : "完了にする"}`}
          className="h-4 w-4 accent-[var(--ak-ink2)]"
        />
        <div className="min-w-0">
          <div className={cn("text-[13.5px] font-medium", done && "text-ak-ink3 line-through")}>{task.title}</div>
          <div className="flex flex-wrap items-center gap-x-2 text-[11.5px] text-ak-ink3">
            {task.step && <span>{task.step}</span>}
            <span>{STATUS_LABEL[task.status]}</span>
            {task.status === "waiting" && <WaitDays task={task} />}
            {!done && task.ballId === me && <BallMark label="自分の番" />}
          </div>
        </div>
        <DueBadge due={task.due} done={done} />
      </div>
      {!done && (
        <div className="ml-7 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto] sm:items-center">
          <label className="flex flex-col text-[10.5px] text-ak-ink3">
            ボール
            <PartySelect value={task.ballId} onChange={(v) => passBall(task.id, v, me)} ariaLabel={`${task.title}のボール`} className="text-[12px]" />
          </label>
          <label className="flex flex-col text-[10.5px] text-ak-ink3">
            担当
            <PartySelect
              value={task.assigneeId}
              include={["member"]}
              onChange={(v) =>
                updateTask(task.id, task.ballId === task.assigneeId ? { assigneeId: v, ballId: v } : { assigneeId: v })
              }
              ariaLabel={`${task.title}の担当`}
              className="text-[12px]"
            />
          </label>
          <label className="flex flex-col text-[10.5px] text-ak-ink3">
            期日
            <input
              type="date"
              aria-label={`${task.title}の期日`}
              className={cn(inputCls, "py-1 text-[12px]")}
              value={task.due}
              onChange={(e) => e.target.value && updateTask(task.id, { due: e.target.value, start: task.start > e.target.value ? e.target.value : task.start })}
            />
          </label>
          {confirmDelete ? (
            <span className="flex items-center gap-1 self-end text-[11.5px]">
              <button type="button" className="rounded border border-ak-late px-1.5 text-ak-late" onClick={() => deleteTask(task.id)}>
                削除する
              </button>
              <button type="button" className="rounded border border-ak-line px-1.5 text-ak-ink2" onClick={() => setConfirmDelete(false)}>
                やめる
              </button>
            </span>
          ) : (
            <button
              type="button"
              aria-label={`${task.title}を削除`}
              className="self-end rounded p-1.5 text-ak-ink3 hover:bg-ak-late-soft hover:text-ak-late"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddTaskForm({ projectId, defaultAssignee }: { projectId: string; defaultAssignee: string }) {
  const addTask = useAnken((s) => s.addTask);
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(defaultAssignee);
  const [due, setDue] = useState(addDays(todayISO(), 7));
  return (
    <form
      className="mt-3 grid grid-cols-1 gap-2 border-t border-dashed border-ak-line pt-3 sm:grid-cols-[minmax(0,1fr)_140px_140px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        addTask({ projectId, title: title.trim(), assigneeId, due });
        setTitle("");
      }}
    >
      <input id="at-title" className={inputCls} placeholder="タスクを追加" value={title} onChange={(e) => setTitle(e.target.value)} />
      <PartySelect id="at-assignee" value={assigneeId} include={["member"]} onChange={setAssigneeId} ariaLabel="担当" />
      <input id="at-due" type="date" aria-label="期日" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
      <button type="submit" className={cn(btn.base, btn.secondary)} disabled={!title.trim()}>
        追加
      </button>
    </form>
  );
}

function ReviewLink({ task }: { task: Task }) {
  const parties = usePartyMap();
  const toast = useToast((s) => s.show);
  const path = `/anken/review/${task.id}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      toast("確認リンクをコピーしました");
    } catch {
      toast("コピーできませんでした");
    }
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-ak-ball px-2.5 py-2">
      <div className="min-w-0 text-[12.5px]">
        <div className="truncate font-medium">{task.title}</div>
        <div className="truncate text-[11.5px] text-ak-ink3">{partyLabel(parties[task.ballId])} あて</div>
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={copy} className="rounded p-1.5 text-ak-ink2 hover:bg-ak-wire" aria-label="リンクをコピー">
          <Copy size={15} />
        </button>
        <Link href={path} className="rounded p-1.5 text-ak-ink2 hover:bg-ak-wire" aria-label="相手側の画面を開く" title="相手側の画面を開く">
          <ExternalLink size={15} />
        </Link>
      </div>
    </div>
  );
}
